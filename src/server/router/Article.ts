import { createRouter } from "./context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

import slugify from "slugify";

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
  })
  .query("createArticle", {
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
      const makeid = (length: number) => {
        var result = "";
        var characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
          result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
          );
        }
        return result;
      };

      const slugified = slugify(input.title, {
        replacement: "-",
        lower: true,
        strict: true,
      }).substring(0, 20);

      const slug = slugified + "-" + makeid(5);

      const article = await prisma?.article.create({
        data: {
          authorId: ctx.session?.user?.id!,
          title: input.title,
          description: input.description,
          slug: slug,
          bodyData: input.bodyData,
        },
      });

      return {
        id: article?.id,
        slug: article?.slug,
        isPublished: article?.isPublished,
      };
    },
  });
