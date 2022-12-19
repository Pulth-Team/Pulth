import { createRouter } from "./context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// returns a router with the batch data route
export const ArticleRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    // Any queries or mutations after this middleware will
    // raise an error unless there is a current session
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
  .query("getUserArticleInfos", {
    input: z.object({
      userId: z.string().optional(),
    }),
    async resolve({ input }) {
      return await prisma?.article.findMany({
        where: {
          authorId: input.userId,
        },
      });
    },
  });
