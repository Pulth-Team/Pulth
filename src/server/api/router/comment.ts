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
      });

      // If the comment doesn't exist, return an error
      if (!commentData)
        throw new TRPCError({
          message: "Comment not found, make sure you are the author",
          code: "NOT_FOUND",
        });

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
});
