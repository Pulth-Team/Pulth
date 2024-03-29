import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const tagRouter = createTRPCRouter({
  addTagToSlug: protectedProcedure
    .input(z.object({ slug: z.string(), tagId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { prisma, session } = ctx;
      const { user } = session;

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
        where: { id: input.tagId },
        select: { id: true },
      });

      // check if the tag exists
      if (!tag)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tag not found",
        });

      //check if the tag is already assigned to the article
      const tagsOnPosts = await prisma.tagsOnPosts.findFirst({
        where: {
          articleId: article.id,
          tagId: tag.id,
        },
      });

      // if the tag is already assigned to the article, return an error
      if (tagsOnPosts)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tag is already assigned to the article",
        });

      // if the tag is not assigned to the article, create the tag
      const newTag = await prisma.tagsOnPosts.create({
        data: {
          tagId: tag.id,
          articleId: article.id,
          assignedById: user.id,
        },
      });

      return newTag;
    }),

  // remove a tag from an article
  removeTagFromSlug: protectedProcedure
    .input(z.object({ slug: z.string(), tagId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { prisma, session } = ctx;

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
        where: { id: input.tagId },
        select: { id: true },
      });

      // check if the tag exists
      if (!tag)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tag not found",
        });

      // delete the tag
      const tagsOnPosts = await prisma.tagsOnPosts.deleteMany({
        where: {
          articleId: article.id,
          tagId: tag.id,
        },
      });

      return tagsOnPosts;
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

  searchTags: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input, ctx }) => {
      const { prisma } = ctx;

      // return all tags that includes the query
      const tags = await prisma.tag.findMany({
        where: {
          name: {
            contains: input.query,
            mode: "insensitive",
          },
        },
        select: {
          name: true,
          id: true,
        },
        take: 5,
      });

      return tags;
    }),

  searchArticlesByTag: publicProcedure
    .input(
      z.intersection(
        z.union([
          z.object({ tagId: z.string() }),
          z.object({ tagName: z.string() }),
          z.object({ tagSlug: z.string() }),
        ]),
        z.object({ take: z.number().default(10), skip: z.number().default(0) })
      )
    )
    .query(async ({ input, ctx }) => {
      const { prisma } = ctx;

      let tagWhereInput;
      // if tagId is provided, search by tagId
      if ("tagId" in input) {
        tagWhereInput = {
          id: input.tagId,
        };
      }

      // if tagName is provided, search by tagName
      if ("tagName" in input) {
        tagWhereInput = {
          name: input.tagName,
        };
      }

      // if tagSlug is provided, search by tagSlug
      if ("tagSlug" in input) {
        tagWhereInput = {
          slug: input.tagSlug,
        };
      }

      if (!tagWhereInput)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You must provide either tagId, tagName, or tagSlug",
        });

      // find the tag
      const articlesInTag = await prisma.article.findMany({
        where: {
          // only return published articles
          isPublished: true,

          // find all articles that have this tag
          tags: {
            some: {
              tag: tagWhereInput,
            },
          },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,

          // return the createdAt date
          createdAt: true,

          // return the author of the article
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },

        orderBy: {
          // order by createdAt date
          createdAt: "desc",
        },

        take: input.take,
        skip: input.skip,
      });

      return articlesInTag;
    }),

  createTag: protectedProcedure
    .input(z.object({ name: z.string(), slug: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { prisma } = ctx;

      // create the tag
      const tag = await prisma.tag.create({
        data: {
          name: input.name,
          slug: input.slug,
        },
      });

      return tag;
    }),
  getPopularTags: publicProcedure.query(async ({ ctx }) => {
    //
    const { prisma } = ctx;

    const tagsWithUsageCount = await prisma.tag.findMany({
      take: 10,
      include: {
        _count: true,
      },
    });

    // sort the tags by usage count
    // highest usage count first
    const sortedTags = tagsWithUsageCount
      .sort((a, b) => b._count.articles - a._count.articles)
      .filter((tag) => tag._count.articles !== 0);

    console.log(sortedTags);
    // return the sorted tags
    return sortedTags;
  }),
});
