import { createRouter } from "./context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// returns a router with the batch data route
export const ArticleRouter = createRouter()
  .query("getArticleBySlug", {
    input: z.object({
      slug: z.string(),
    }),
    async resolve({ input }) {
      const article = await prisma?.article.findUnique({
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
        };
      }
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
