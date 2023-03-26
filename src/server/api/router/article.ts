import { z } from "zod";
import { ObjectId } from "bson";
import slugify from "slugify";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const articleRouter = createTRPCRouter({
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
        isPublished: true,
        // should we include the comments here?
        // we shouldnt but we are for now
        Comments: {
          select: {
            // id: true,
            // author: {
            //   select: {
            //     id: true,
            //     name: true,
            //     image: true,
            //   },
            // },
            content: true,
            parentIds: true,
          },
        },
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

    const { isPublished, ...rest } = article;
    return rest;
  }),

  // this will be replaced with a recommended articles query
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

      // maybe we should check if the slug already exists
      // YAGNI for now

      // create the article
      const article = await ctx.prisma?.article.create({
        data: {
          title: input.title,
          description: input.description,
          slug,
          bodyData: [],
          authorId: ctx.session?.user.id,
        },
      });

      return article;
    }),

  inspect: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
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
          message: "Article not found in your account",
        });

      return article;
    }),

  publish: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        setUnpublished: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
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
          message: "Article with given slug not found",
        });

      // check if the article is already published
      if (article.isPublished && !input.setUnpublished)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Article is already published",
        });

      // check if the article is already unpublished
      if (!article.isPublished && input.setUnpublished)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Article is already a draft",
        });

      // update the article
      const updatedArticle = await ctx.prisma?.article.update({
        where: {
          id: article.id,
        },
        data: {
          isPublished: !input.setUnpublished,
        },
      });

      //check if the article was updated
      if (!updatedArticle)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });

      return updatedArticle;
    }),

  updateBody: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        bodyData: z.array(
          z.object({
            id: z.string(),
            type: z.string(),
            data: z.any(),
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
      });

      // if the article doesn't exist, return an error
      if (!article)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found in current user's articles",
        });

      // update the article
      const updatedArticle = await ctx.prisma?.article.update({
        where: {
          id: article.id,
        },
        data: {
          bodyData: input.bodyData,
        },
      });

      //check if the article was updated
      if (!updatedArticle)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });

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
        newSlug = slugify(input.title, { lower: true });
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

      //check if the article was updated
      if (!updatedArticle)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });

      return updatedArticle;
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      // find the article
      const article = await ctx.prisma?.article.findFirst({
        where: {
          slug: input,
          authorId: ctx.session?.user.id,
        },
      });

      // if the article doesn't exist, return an error
      if (!article)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found in current user's articles",
        });

      // delete the article
      const deletedArticle = await ctx.prisma?.article.delete({
        where: {
          id: article.id,
        },
      });

      //check if the article was deleted
      if (!deletedArticle)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });

      return deletedArticle;
    }),
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
  }).substring(0, 128) +
  "-" +
  makeid(8);
