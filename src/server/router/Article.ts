import { createRouter } from "./context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { env } from "../../env/server.mjs";
import algoliasearch from "algoliasearch";

import slugify from "slugify";

const client = algoliasearch(env.ALGOLIA_APP_ID, env.ALGOLIA_API_KEY);

// returns a router with the batch data route
export const ArticleRouter = createRouter()
  .query("getArticleBySlug", {
    input: z.object({
      slug: z.string(),
    }),
    async resolve({ input, ctx }) {
      const article = await ctx.prisma?.article.findUnique({
        where: {
          slug: input.slug,
        },
        select: {
          id: true,
          title: true,
          description: true,
          bodyData: true,
          author: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
          isPublished: true,
          Comments: {
            select: {
              id: true,
              content: true,
              rating: true,
              author: {
                select: {
                  name: true,
                  image: true,
                  id: true,
                },
              },
              parentId: true,
            },
          },
        },
      });
      if (!article?.isPublished) {
        return {
          error: "Article not Published",
        };
      } else {
        return {
          id: article.id,
          title: article.title,
          description: article.description,
          bodyData: article.bodyData,
          author: article.author,
          Comments: article.Comments,
        };
      }
    },
  })
  .query("getLatestArticles", {
    input: z.object({
      limit: z.number().optional().default(10),
      skip: z.number().optional().default(0),
    }),
    async resolve({ input, ctx }) {
      const articles = await ctx.prisma?.article.findMany({
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
      return articles;
    },
  })
  .middleware(async ({ ctx, next }) => {
    // Any queries or mutations after this middleware will
    // raise an error unless there is a current session
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
  .query("publishArticle", {
    input: z.object({
      slug: z.string(),
      isPublishEvent: z.boolean().optional().default(true),
    }),
    async resolve({ input, ctx }) {
      // check if user is the author of the article
      const isArticle = await ctx.prisma?.article.findFirst({
        where: {
          slug: input.slug,
          authorId: ctx.session?.user?.id,
        },
      });
      // if with the slug and authorId there is no article
      if (!isArticle) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const article = await ctx.prisma?.article.update({
        where: {
          slug: input.slug,
        },
        data: {
          isPublished: input.isPublishEvent,
        },
      });
      client
        .initIndex(env.ALGOLIA_INDEX_NAME)
        .saveObject({
          objectID: article?.id,
          title: article?.title,
          description: article?.description,
          author: ctx.session?.user?.name,
          slug: article?.slug,
        })
        .catch((err) => {
          console.log("Failed to create article in algolia", err);
        });
      return article;
    },
  })
  .query("updateArticleBody", {
    input: z.object({
      slug: z.string(),
      bodyData: z.array(
        z.object({ id: z.string(), type: z.string(), data: z.any() })
      ),
    }),
    async resolve({ input, ctx }) {
      // check if user is the author of the article
      const isArticle = await ctx.prisma?.article.findFirst({
        where: {
          slug: input.slug,
          authorId: ctx.session?.user?.id,
        },
      });
      // if with the slug and authorId there is no article
      if (!isArticle) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const article = await ctx.prisma?.article.update({
        where: {
          slug: input.slug,
        },
        data: {
          bodyData: input.bodyData,
        },
      });
      return article;
    },
  })
  .mutation("deleteArticleBySlug", {
    input: z.object({
      slug: z.string(),
    }),
    async resolve({ input, ctx }) {
      // check if user is the author of the article
      const isArticle = await ctx.prisma?.article.findFirst({
        where: {
          slug: input.slug,
          authorId: ctx.session?.user?.id,
        },
      });
      // if with the slug and authorId there is no article
      if (!isArticle) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const article = await ctx.prisma?.article.delete({
        where: {
          slug: input.slug,
        },
      });

      client
        .initIndex(env.ALGOLIA_INDEX_NAME)
        .deleteObject(article?.id)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log("Failed to delete article in algolia", err);
        });

      return article;
    },
  })
  .query("getUserArticleInfos", {
    input: z.object({
      userId: z.string().optional(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma?.article.findMany({
        where: {
          authorId: input.userId,
        },
      });
    },
  })
  .query("getArticleBySlugAuthor", {
    input: z.object({
      slug: z.string(),
    }),
    async resolve({ input, ctx }) {
      const article = await ctx.prisma?.article.findFirst({
        where: {
          slug: input.slug,
          authorId: ctx.session?.user?.id,
        },
        select: {
          id: true,
          title: true,
          description: true,
          bodyData: true,
          updatedAt: true,
          createdAt: true,
          editorVersion: true,
          isPublished: true,
        },
      });
      return article as {
        id: string;
        title: string;
        description: string;
        bodyData: any;
        updatedAt: Date;
        createdAt: Date;
        editorVersion: string;
        isPublished: boolean;
      };
    },
  })
  .query("updateArticleCredidantials", {
    input: z.object({
      slug: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    }),
    async resolve({ input, ctx }) {
      // check if user is the author of the article
      if (!input.title && !input.description) {
        return { message: "No data to update" };
      }

      const isArticle = await ctx.prisma?.article.findFirst({
        where: {
          slug: input.slug,
          authorId: ctx.session?.user?.id,
        },
        select: {
          id: true,
        },
      });
      // if with the slug and authorId there is no article

      if (!isArticle) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      let updateBody: {
        title: string | undefined;
        slug: string | undefined;
        description: string | undefined;
        keywords: string[] | undefined;
      } = {
        title: undefined,
        slug: undefined,
        description: undefined,
        keywords: undefined,
      };
      if (input.title) {
        updateBody.title = input.title;
        updateBody.slug = slugified(input.title) + "-" + makeid(5);
      }
      if (input.description) {
        updateBody.description = input.description;
      }

      if (input.keywords) {
        updateBody.keywords = input.keywords;
      }

      const article = await ctx.prisma?.article.update({
        where: {
          id: isArticle.id,
        },
        data: updateBody,
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
        },
      });

      client.initIndex(env.ALGOLIA_INDEX_NAME).saveObject({
        objectID: article?.id,
        title: article?.title,
        description: article?.description,
        slug: article?.slug,
        author: ctx.session?.user?.name,
      });
      return article as {
        id: string;
        title: string;
        description: string;
        slug: string;
      };
    },
  })
  .mutation("createArticle", {
    input: z.object({
      title: z.string(),
      description: z.string(),
      bodyData: z.array(
        z.object({
          id: z.string(),
          type: z.string(),
          data: z.any(),
        })
      ),
    }),
    async resolve({ input, ctx }) {
      const slug = slugified(input.title) + "-" + makeid(5);

      const article = await ctx.prisma?.article.create({
        data: {
          authorId: ctx.session?.user?.id!,
          title: input.title,
          description: input.description,
          slug: slug,
          bodyData: input.bodyData,
        },
      });
      // we are not indexing the article in algolia
      // if the article is not published
      // in this case the default value is false

      return {
        id: article?.id,
        slug: article?.slug,
        isPublished: article?.isPublished,
      };
    },
  });

const makeid = (length: number) => {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const slugified = (title: string) =>
  slugify(title, {
    replacement: "-",
    lower: true,
    strict: true,
  }).substring(0, 20);
