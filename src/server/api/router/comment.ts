import { z } from "zod";

import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const commentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        articleId: z.string(),
        content: z.string(),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      //if there isnt a parent comment, create the comment
      if (!input.parentId)
        return await ctx.prisma?.comment.create({
          data: {
            content: input.content,
            articleId: input.articleId,
            authorId: ctx.session?.user.id,
          },
        });

      // find the parent comment
      const parentComment = await ctx.prisma?.comment.findUnique({
        where: {
          id: input.parentId,
        },
      });

      // if the parent comment doesn't exist, return an error
      if (!parentComment)
        throw new TRPCError({
          message: "Parent comment not found",
          code: "NOT_FOUND",
        });

      // Create the comment with the parent comment id in the parentIds array
      const newComment = await ctx.prisma?.comment.create({
        data: {
          content: input.content,
          articleId: input.articleId,
          authorId: ctx.session?.user.id,

          // Add the parent comment id to the parentIds array
          parentIds: {
            set: [...parentComment.parentIds, input.parentId],
          },
        },
      });

      if (newComment)
        ctx.prisma.article
          .findUnique({
            where: { id: input.articleId },
            select: {
              slug: true,
            },
          })
          .then((article) => {
            ctx.res?.revalidate(`/articles/${article?.slug}`);
          });

      await ctx.prisma.comment.update({
        where: {
          id: input.parentId,
        },
        data: {
          // Add the new comment id to the childIds array
          childIds: {
            set: [...parentComment.childIds, newComment.id],
          },
        },
      });

      return newComment;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if the comment exists
      // which's author is the current user
      const commentData = await ctx.prisma?.comment.findFirst({
        where: {
          id: input.id,
          authorId: ctx.session?.user.id,
        },
        select: {
          id: true,
          Article: {
            select: {
              slug: true,
            },
          },
        },
      });

      // If the comment doesn't exist, return an error
      if (!commentData)
        throw new TRPCError({
          message: "Comment not found, make sure you are the author",
          code: "NOT_FOUND",
        });

      // Delete all the child comments
      // This will also delete all the child comments of the child comments
      await ctx.prisma?.comment.deleteMany({
        where: {
          parentIds: {
            has: input.id,
          },
        },
      });

      ctx.res?.revalidate(`/articles/${commentData.Article.slug}`);

      // Delete the comment
      await ctx.prisma?.comment.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if the comment exists
      // which's author is the current user
      const commentData = await ctx.prisma?.comment.findFirst({
        where: {
          id: input.id,
          authorId: ctx.session?.user.id,
        },
        select: {
          id: true,
          Article: {
            select: {
              slug: true,
            },
          },
        },
      });

      // If the comment doesn't exist, return an error
      if (!commentData)
        throw new TRPCError({
          message: "Comment not found, make sure you are the author",
          code: "NOT_FOUND",
        });

      // Revalidate the article page
      ctx.res?.revalidate(`/articles/${commentData.Article.slug}`);

      // Update the comment
      // and set isEdited to true
      return await ctx.prisma?.comment.update({
        where: {
          id: input.id,
        },
        data: {
          content: input.content,
          isEdited: true,
        },
      });
    }),

  getBySlug: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    // Get the article
    const article = await ctx.prisma?.article.findUnique({
      where: {
        slug: input,
      },
      select: {
        id: true,
      },
    });

    // If the article doesn't exist, return an error
    if (!article)
      throw new TRPCError({
        message: "Article not found",
        code: "NOT_FOUND",
      });

    // Get the comments
    const allComments = await ctx.prisma?.comment.findMany({
      where: {
        articleId: article.id,
      },
      select: {
        id: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        isEdited: true,
        content: true,
        parentIds: true,
      },
    });

    const RootCommentsCount = allComments?.filter(
      (comment) => comment.parentIds.length === 0
    ).length;

    return {
      comments: allComments,
      rootCommentsCount: RootCommentsCount,
    };
  }),
  getByArticleId: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      // Get the comments
      const allComments = await ctx.prisma?.comment.findMany({
        where: {
          articleId: input,
        },
        select: {
          id: true,
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          isEdited: true,
          content: true,
          parentIds: true,
        },
      });

      const RootCommentsCount = allComments?.filter(
        (comment) => comment.parentIds.length === 0
      ).length;

      return {
        comments: allComments,
        rootCommentsCount: RootCommentsCount,
      };
    }),
});
