import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

export const authRouter = createRouter()
  .query("getSession", {
    resolve({ ctx }) {
      return ctx.session;
    },
  })
  .query("updateSettings", {
    input: z.object({
      userId: z.string(),

      data: z.object({
        name: z.string().optional(),

        // todo Add Photo Change
        // "photo": z.string().optional()

        // Todo Add change Email
        // "email": z.string().optional()
      }),
    }),
    async resolve({ input, ctx }) {
      const updatedUser = await ctx.prisma?.user.update({
        where: {
          id: input.userId,
        },
        data: {
          name: input.data.name ?? undefined,
        },
      });

      return updatedUser ? "Updated" : "Something went wrong while updating";
    },
  })
  .middleware(async ({ ctx, next }) => {
    // Any queries or mutations after this middleware will
    // raise an error unless there is a current session
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
  .query("getSecretMessage", {
    async resolve({ ctx }) {
      return "You are logged in and can see this secret message!";
    },
  });
