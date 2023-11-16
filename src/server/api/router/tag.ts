import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const tagRouter = createTRPCRouter({
  addTagToSlug: publicProcedure
    .input(z.object({ slug: z.string(), tag: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { prisma } = ctx;
      // find the article
      const article = await prisma.article.findUnique({
        where: { slug: input.slug },
        select: { id: true },
      });

      // check if the article exists
      if (!article)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });

      // find the tag
      const tag = await prisma.tag.findUnique({
        where: { name: input.tag },
        select: { id: true },
      });

      // check if the tag exists
      if (!tag)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tag not found",
        });

      // add the tag to the article
      return await prisma.article.update({
        where: { slug: input.slug },
        data: {
          tags: {
            connect: { id: tag.id },
          },
        },
      });
    }),

  getTagsBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      const { prisma, session } = ctx;

      // find the article
      const article = await prisma.article.findUnique({
        where: { slug: input.slug },
        select: {
          id: true,
          isPublished: true,
          tags: {
            select: {
              tag: true,
            },
          },
          authorId: true,
        },
      });

      // check if the article exists
      if (!article)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });

      // check if the article is published
      // if published, return all tags
      if (article.isPublished) return article.tags;

      // if not published, check if the user is logged in
      if (!session?.user.id)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view this article's tags",
        });

      // if logged in, check if the user is the author of the article
      if (session.user.id !== article.authorId)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be the author of this article to view its tags",
        });

      // if the user is the author of the article, return all tags
      return article.tags;
    }),
});
