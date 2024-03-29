import { z } from "zod";
import { ObjectId } from "bson";
import slugify from "slugify";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { OutputBlockType } from "~/components/editor/renderer/DocumentRenderer";
import { OutputBlockData } from "@editorjs/editorjs/types/data-formats/output-data";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

import { env } from "~/env.mjs";
import { Article } from "@prisma/client";

export const articleRouter = createTRPCRouter({
  // takes a slug and returns an article without isPublished value
  getBySlug: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const article = await ctx.prisma?.article.findUnique({
      where: {
        slug: input,
      },
      select: {
        id: true,
        title: true,
        description: true,
        bodyData: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        keywords: true,
        isPublished: true,
      },
    });
    // if the article doesn't exist, return null
    if (!article)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Article with given slug not found",
      });

    // if the article is not published, return a generic error
    if (!article.isPublished)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Article with given slug not found",
      });

    const { isPublished, bodyData, ...rest } = article;
    return {
      ...rest,
      bodyData: bodyData as unknown as OutputBlockType[],
    };
  }),

  // WARNING: this will be replaced with a recommended articles query
  // this will be achieved by using neo4j
  getLatest: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        skip: z.number().optional().default(0),
      })
    )
    .query(({ input, ctx }) => {
      return ctx.prisma?.article.findMany({
        where: {
          isPublished: true,
        },
        select: {
          title: true,
          description: true,
          slug: true,
          author: {
            select: {
              name: true,
              image: true,
              id: true,
            },
          },
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: input.limit,
        skip: input.skip,
      });
    }),

  // takes a user id and returns a list of articles
  // articles are sorted by createdAt
  // articles are paginated
  // articles are only returned if they are published
  // articles has only title, description and slug
  getByAuthor: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().optional().default(10),
        skip: z.number().optional().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      // check if the input is a valid ObjectId
      if (!ObjectId.isValid(input.userId))
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User id is not a valid ObjectId",
        });

      // find the user
      const userArticles = await ctx.prisma?.article.findMany({
        where: {
          authorId: input.userId,
          isPublished: true,
        },
        select: {
          title: true,
          description: true,
          slug: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: input.limit,
        skip: input.skip,
      });

      return userArticles;
    }),

  // returns a list of articles of an currently logged in user
  // articles are sorted by createdAt
  // articles are paginated
  getMyArticles: protectedProcedure
    .input(
      z
        .object({
          pageSize: z.number().default(9),
          cursor: z.number().nullish(), // cursor is the page number
          skipCountQuery: z.boolean().default(true),
          filters: z
            .object({
              isPublished: z.boolean(),
              isDraft: z.boolean(),
              timePeriod: z.enum(["all", "lastWeek", "lastMonth"]),
              orderBy: z.enum([
                "Newest",
                "Oldest",
                "Most Recent",
                "Title (A-Z)",
                "Title (Z-A)",
              ]),
            })
            .optional()
            .default({
              isPublished: true,
              isDraft: true,
              timePeriod: "all",
              orderBy: "Newest",
            }),
        })
        .default({
          cursor: 0,
        })
    )
    .query(async ({ input, ctx }) => {
      console.log({
        skip: (input.cursor ?? 0) * input.pageSize,
        take: input.pageSize + 1,
        input: {
          cursor: input.cursor,
          pageSize: input.pageSize,
        },
      });

      const articlesPromise = ctx.prisma?.article.findMany({
        where: {
          authorId: ctx.session?.user.id,
          // if isPublished is true only return published articles
          // if isDraft is true only return draft articles
          // if both are true return both
          // if both are false return both
          isPublished: ((): boolean | undefined => {
            if (input.filters?.isPublished && !input.filters?.isDraft)
              return true;
            if (!input.filters?.isPublished && input.filters?.isDraft)
              return false;

            return undefined;
          })(),
          // if timePeriod is all, then return all articles
          // if timePeriod is lastWeek, then return articles that are created in the last week
          // if timePeriod is lastMonth, then return articles that are created in the last month
          createdAt: (() => {
            if (input.filters?.timePeriod === "all") return undefined;
            if (input.filters?.timePeriod === "lastWeek")
              return {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              };
            if (input.filters?.timePeriod === "lastMonth")
              return {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              };
          })(),
        },
        select: {
          title: true,
          description: true,
          slug: true,
          isPublished: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: (() => {
            if (input.filters?.orderBy === "Newest") return "desc";
            if (input.filters?.orderBy === "Oldest") return "asc";
            return undefined;
          })(),
          updatedAt: (() => {
            if (input.filters?.orderBy === "Most Recent") return "desc";
            return undefined;
          })(),
          title: (() => {
            if (input.filters?.orderBy === "Title (A-Z)") return "asc";
            if (input.filters?.orderBy === "Title (Z-A)") return "desc";
            return undefined;
          })(),
        },
        skip: (input.cursor ?? 0) * input.pageSize,
        take: input.pageSize + 1,
      });

      let articleCountPromise: Promise<number> | undefined = undefined;
      if (!input.skipCountQuery) {
        articleCountPromise = ctx.prisma?.article.count({
          where: {
            authorId: ctx.session?.user.id,
            // if isPublished is true only return published articles
            // if isDraft is true only return draft articles
            // if both are true return both
            // if both are false return both
            isPublished: ((): boolean | undefined => {
              if (input.filters?.isPublished && !input.filters?.isDraft)
                return true;
              if (!input.filters?.isPublished && input.filters?.isDraft)
                return false;

              return undefined;
            })(),
            // if timePeriod is all, then return all articles
            // if timePeriod is lastWeek, then return articles that are created in the last week
            // if timePeriod is lastMonth, then return articles that are created in the last month
            createdAt: (() => {
              if (input.filters?.timePeriod === "all") return undefined;
              if (input.filters?.timePeriod === "lastWeek")
                return {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                };
              if (input.filters?.timePeriod === "lastMonth")
                return {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                };
            })(),
          },
        });
      }

      const [articles, articleCount] = await Promise.all([
        articlesPromise,
        articleCountPromise,
      ]);

      let hasNextPage = false;
      const hasPreviousPage = (input.cursor ?? 0) > 0;

      if (articles.length > input.pageSize) {
        articles.pop();
        hasNextPage = true;
      }
      console.log("server", { hasNextPage, articleLen: articles.length });

      return {
        articles,
        hasNextPage,
        hasPreviousPage,
        // if skipCountQuery is true, then dont return articleCount
        // if skipCountQuery is false, then return articleCount
        articleCount: input.skipCountQuery ? undefined : articleCount,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // create a slug
      const slug = slugified(input.title);

      // TODO: maybe we should check if the slug already exists
      // YAGNI for now

      // create the article
      const article = await ctx.prisma?.article.create({
        data: {
          title: input.title,
          description: input.description,
          slug,
          bodyData: [],
          draftBodyData: [],
          authorId: ctx.session?.user.id,
        },
      });

      // we dont add it to the algolia index here
      // we will add it to the algolia index when the article is published
      return article;
    }),

  // takes an article slug and returns the article
  // the article is only returned if the user is the author
  inspect: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      // find the article
      const article = await ctx.prisma?.article.findFirst({
        where: {
          slug: input.slug,
          authorId: ctx.session?.user.id,
        },
        select: {
          title: true,
          description: true,
          keywords: true,
          isPublished: true,

          updatedAt: true,
          createdAt: true,
          tags: {
            select: {
              tag: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      // if the article doesn't exist, return an error
      if (!article)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found in your account",
        });

      return article;
    }),

  // gives article's slug
  editData: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const article = await ctx.prisma?.article.findUnique({
        where: {
          slug: input,
        },
        select: {
          title: true,
          bodyData: true,
          draftBodyData: true,
          isPublished: true,
          authorId: true,
        },
      });

      if (!article)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });

      if (ctx.session.user.id != article?.authorId)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not allowed to request this data",
        });

      return {
        title: article.title,
        bodyData: article.bodyData as unknown as OutputBlockData<string, any>[],
        draftBodyData: article.draftBodyData as unknown as OutputBlockData<
          string,
          any
        >[],
        isPublished: article.isPublished,
      };
    }),

  publish: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        editorData: z.array(
          z.object({
            id: z.string().optional(),
            type: z.string(),
            data: z.any().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // find the article with that userID and slug
      const article = await ctx.prisma?.article.findFirst({
        where: {
          slug: input.slug,
          authorId: ctx.session?.user.id,
        },
        select: {
          id: true,
          draftBodyData: true,
          // for algolia
          title: true,
          description: true,
        },
      });

      if (!article)
        // if the article doesn't exist, return an error
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article with given slug not found",
        });

      let updatedArticle: Article | null = null;

      // if unsaved changes exists
      if (article?.draftBodyData !== input.editorData)
        // then update draftBodyData and bodyData
        updatedArticle = await ctx.prisma?.article
          .update({
            where: {
              id: article.id,
            },
            data: {
              isPublished: true,
              bodyData: input.editorData || [],
              draftBodyData: input.editorData,
            },
          })
          .catch(() => {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Something went wrong",
            });
          });
      // if there isnt any unsaved changes then swap draftBodyData to bodyData
      else
        updatedArticle = await ctx.prisma?.article
          .update({
            where: {
              id: article.id,
            },
            data: {
              isPublished: true,
              bodyData: article.draftBodyData || [],
            },
          })
          .catch(() => {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Something went wrong",
            });
          });

      await ctx.algolia.partialUpdateObject(
        {
          objectID: updatedArticle.id,
          slug: updatedArticle.slug,
          title: updatedArticle.title,
          description: updatedArticle.description,

          author: {
            id: ctx.session?.user.id,
            name: ctx.session?.user.name,
            image: ctx.session?.user.image,
          },
          publishedAt: updatedArticle.createdAt.getTime(),
          updatedAt: updatedArticle.updatedAt.getTime(),
        },
        {
          createIfNotExists: true,
        }
      );

      // everything went well, before returning the article
      // we need to convert the bodyData from PrismaJson to OutputBlockData
      const { bodyData, ...rest } = updatedArticle;

      // now we can revalidate the article
      ctx.res?.revalidate(`/api/articles/${updatedArticle.slug}`);

      return {
        ...rest,
        bodyData: bodyData as unknown as OutputBlockData<string, any>[],
      };
    }),

  unpublish: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const article = await ctx.prisma?.article.findFirst({
        where: {
          slug: input,
          authorId: ctx.session?.user.id,
        },
        select: {
          id: true,
          draftBodyData: true,
        },
      });

      if (!article)
        // if the article doesn't exist, return an error
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article with given slug not found",
        });

      // reset the bodyData to the draftBodyData,
      // so that the user can continue editing the article without losing their progress
      // and set isPublished to false
      const updatedArticle = await ctx.prisma?.article.update({
        where: {
          id: article.id,
        },
        data: {
          isPublished: false,
          bodyData: article.draftBodyData || [],
        },
      });

      // delete the article from algolia
      // so that it doesn't show up in search results anymore
      await ctx.algolia.deleteObject(article.id);

      // now we can revalidate the article
      ctx.res?.revalidate(`/api/articles/${updatedArticle.slug}`);

      const { bodyData, ...rest } = updatedArticle;
      return {
        ...rest,
        bodyData: bodyData as unknown as OutputBlockData<string, any>[],
      };
    }),

  undoChanges: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const article = await ctx.prisma?.article.findFirst({
        where: {
          slug: input,
          authorId: ctx.session?.user.id,
        },
        select: {
          id: true,
          bodyData: true,
        },
      });

      if (!article)
        // if the article doesn't exist, return an error
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article with given slug not found",
        });

      // reset draftBodyData to bodyData
      const updatedArticle = await ctx.prisma?.article.update({
        where: {
          id: article.id,
        },
        data: {
          draftBodyData: article.bodyData || [],
        },
      });

      const { bodyData, ...rest } = updatedArticle;
      return {
        ...rest,
        bodyData: bodyData as unknown as OutputBlockData<string, any>[],
      };
    }),
  updateBody: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        bodyData: z.array(
          z.object({
            id: z.string().optional(),
            type: z.string(),
            data: z.any().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // find the article
      const article = await ctx.prisma?.article.findFirst({
        where: {
          slug: input.slug,
          authorId: ctx.session?.user.id,
        },
        select: {
          authorId: true,
          bodyData: true,
          id: true,
        },
      });

      // if the article doesn't exist, return an error
      if (!article)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found in current user's articles",
        });

      // gets the current image blocks in the article
      const currentImageBlocks = (
        article.bodyData as unknown as OutputBlockData<any>[]
      ).filter((block) => block.type === "Image") as OutputBlockData<"Image">[];

      // console.log("current images", currentImageBlocks);

      // gets the new image blocks in the article
      const newImageBlocks = input.bodyData.filter(
        (block) => block.type === "Image"
      ) as OutputBlockData<"Image">[];

      // gets the image blocks that are not in the article anymore
      const deletedImageBlocks = currentImageBlocks.filter(
        (block) => !newImageBlocks.find((newBlock) => newBlock.id === block.id)
      );

      // create a s3 cdn connection Object
      const s3client = new S3Client({
        region: env.AWS_REGION,
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_CDN,
          secretAccessKey: env.AWS_SECRET_KEY_CDN,
        },
      });

      await Promise.all(
        deletedImageBlocks.map((block) => {
          const url = new URL(block.data.file.url);
          console.log("url Pathname", url.pathname);
          return s3client.send(
            new DeleteObjectCommand({
              Bucket: env.AWS_S3_BUCKET, // name of the bucket in S3 where the file will be stored
              Key: url.pathname.slice(1), // remove the first slash
            })
          );
        })
      );

      // update the article
      const updatedArticle = await ctx.prisma?.article.update({
        where: {
          id: article.id,
        },
        data: {
          draftBodyData: input.bodyData,
        },
      });

      //check if the article was updated
      if (!updatedArticle)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });

      // everything went well
      ctx.res?.revalidate(`/articles/${updatedArticle.slug}`);

      return updatedArticle;
    }),

  updateInfo: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        // tags: z.array(z.string()),
        // keywords: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // check if the title or description is provided
      if (!input.title && !input.description)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Title or description is required",
        });

      // find the article
      const article = await ctx.prisma?.article.findFirst({
        where: {
          slug: input.slug,
          authorId: ctx.session?.user.id,
        },
      });

      // if the article doesn't exist, return an error
      if (!article)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found in current user's articles",
        });

      let newSlug = article.slug;
      // if the title is provided, then change slug
      if (input.title) {
        // check if the title is already taken
        const titleTaken = await ctx.prisma?.article.findFirst({
          where: {
            title: input.title,
            authorId: ctx.session?.user.id,
          },
        });

        // if the title is already taken, return an error
        if (titleTaken)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Title is already taken",
          });

        // update the slug
        newSlug = slugified(input.title);
      }

      // update the article
      const updatedArticle = await ctx.prisma?.article.update({
        where: {
          id: article.id,
        },
        data: {
          title: input.title,
          description: input.description,
          slug: newSlug,
        },
      });

      if (updatedArticle.isPublished) {
        await ctx.algolia.partialUpdateObject(
          {
            objectID: updatedArticle.id,
            slug: updatedArticle.slug,
            title: updatedArticle.title,
            description: updatedArticle.description,

            author: {
              id: ctx.session?.user.id,
              name: ctx.session?.user.name,
              image: ctx.session?.user.image,
            },
            publishedAt: updatedArticle.createdAt.getTime(),
            updatedAt: updatedArticle.updatedAt.getTime(),
          },
          {
            createIfNotExists: true,
          }
        );
      } else {
        // if the article is unpublished, remove it from the algolia index
        await ctx.algolia.deleteObject(updatedArticle.id);
      }

      //check if the article was updated
      if (!updatedArticle)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });

      // everything went well
      // now we can revalidate the article
      ctx.res?.revalidate(`/articles/${updatedArticle.slug}`);

      return updatedArticle;
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const { prisma, session, algolia } = ctx;

      // find the article
      const article = await prisma?.article.findFirst({
        where: {
          slug: input,
          authorId: session?.user.id,
        },
      });

      // if the article doesn't exist, return an error
      if (!article)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found in current user's articles",
        });

      const deleteAllComments = prisma.comment.deleteMany({
        where: {
          articleId: article.id,
        },
      });

      const deleteAllVotes = prisma.votedBy.deleteMany({
        where: {
          articleId: article.id,
        },
      });

      const deleteAllTags = prisma.tagsOnPosts.deleteMany({
        where: {
          articleId: article.id,
        },
      });
      const deleteArticle = prisma.article.delete({
        where: {
          id: article.id,
        },
      });

      const [
        resultDeletedComments,
        resultDeletedVotes,
        resultDeletedTags,
        // resultDeletedArticle,
      ] = await prisma.$transaction([
        deleteAllComments,
        deleteAllVotes,
        deleteAllTags,
        // deleteArticle,
      ]);

      let resultDeletedArticle;
      if (resultDeletedTags && resultDeletedVotes && resultDeletedComments) {
        resultDeletedArticle = await deleteArticle;
      }

      //check if the article was deleted
      if (!resultDeletedArticle)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });

      // get the image blocks in the deleted article
      const imageBlocks = (
        article.bodyData as unknown as OutputBlockData<any>[]
      ).filter((block) => block.type === "Image") as OutputBlockData<"Image">[];

      // create a s3 cdn connection Object
      const s3client = new S3Client({
        region: env.AWS_REGION,
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_CDN,
          secretAccessKey: env.AWS_SECRET_KEY_CDN,
        },
      });

      // delete the images from the s3 bucket
      await Promise.all(
        imageBlocks.map((block) => {
          const url = new URL(block.data.file.url);
          console.log("url Pathname", url.pathname);
          return s3client.send(
            new DeleteObjectCommand({
              Bucket: env.AWS_S3_BUCKET, // name of the bucket in S3 where the file will be stored
              Key: url.pathname.slice(1), // remove the first slash
            })
          );
        })
      );

      // delete the article from the algolia index
      await algolia.deleteObject(article.id);

      return deleteArticle;
    }),

  updateKeywords: protectedProcedure
    .input(
      z.object({
        articleSlug: z.string(),
        keywords: z.array(z.string().min(3)).nonempty(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const article = await ctx.prisma?.article.update({
        where: {
          slug: input.articleSlug,
        },
        data: {
          keywords: input.keywords,
        },
        select: {
          keywords: true,
        },
      });

      return article;
    }),
});

const makeid = (length: number) => {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const slugified = (title: string) =>
  slugify(title, {
    replacement: "-",
    lower: true,
    strict: true,
  }).substring(0, 128) +
  "-" +
  makeid(8);
