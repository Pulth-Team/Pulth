import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

export const CommentRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    // Any queries or mutations after this middleware will
    // raise an error unless there is a current session
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
  .mutation("addComment", {
    input: z.object({
      articleId: z.string(),
      content: z.string(),
      parentId: z.string().optional(),
    }),
    async resolve({ input, ctx }) {
      // Check if the user is logged in and has a id
      if (!ctx.session?.user || !ctx.session?.user.id)
        return { message: "Unauthorized", success: false };

      // Create the comment
      return await ctx.prisma?.comment.create({
        data: {
          content: input.content,
          articleId: input.articleId,
          authorId: ctx.session?.user.id,

          parentId: input.parentId ?? undefined,
        },
      });
    },
  })
  .mutation("deleteComment", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      // Check if the user is logged in and has a id
      if (!ctx.session?.user || !ctx.session?.user.id)
        return new TRPCError({
          message: "Unauthorized. No Session",
          code: "UNAUTHORIZED",
        });

      // Check if the comment exists
      const commentData = await ctx.prisma?.comment.findUnique({
        where: {
          id: input.id,
        },
      });

      // If the comment doesn't exist, return an error
      if (!commentData)
        return new TRPCError({
          message: "Comment not found",
          code: "NOT_FOUND",
        });

      // Check if the user is the owner of the comment
      if (commentData.authorId !== ctx.session?.user.id)
        return new TRPCError({
          message: "Unauthorized. Not the owner",
          code: "FORBIDDEN",
        });

      // delete all the nested comments
      // this will delete all replies to the comment
      // and the comment itself

      // WARNING: This will only delete the first-depth children
      // of the comment. If there are replies to the replies, they
      // will not be deleted. This is a limitation of Prisma.
      //

      /*
      const reply = await ctx.prisma?.comment.update({
        where: {
          id: input.id,
        },
        data: {
          children: {
            deleteMany: {},
          },
        },
      });*/

      return { message: "Comment deletion not works yet", success: true };
    },
  })
  .mutation("updateComment", {
    input: z.object({
      id: z.string(),
      content: z.string(),
    }),
    async resolve({ input, ctx }) {
      // Check if the user is logged in and has a id
      if (!ctx.session?.user || !ctx.session?.user.id)
        return new TRPCError({
          message: "Unauthorized. No Session",
          code: "UNAUTHORIZED",
        });
      // Update the comment
      const commentData = await ctx.prisma?.comment.update({
        where: {
          id: input.id,
        },
        data: {
          content: input.content,
        },
      });
      // Check if the comment exists and return an error if it doesn't
      if (!commentData)
        return new TRPCError({
          message: "Comment not found",
          code: "NOT_FOUND",
        });
      else return { message: "Comment updated", success: true };
    },
  });
