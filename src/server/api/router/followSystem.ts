import { z } from "zod";
import { ObjectId } from "bson";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const followSystemRouter = createTRPCRouter({
  followUser: protectedProcedure
    .input(z.object({ accountId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ObjectId.isValid(input.accountId))
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User id is not valid",
        });

      const currentUser = ctx.session.user;

      //checks if user is already following
      const isFollowing = await ctx.prisma.follow.findFirst({
        where: {
          followerId: currentUser.id,
        },
      });

      if (isFollowing)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is already following",
        });

      const follow = await ctx.prisma.follow.create({
        data: {
          followerId: currentUser.id,
          followingId: input.accountId,
        },
      });

      return follow;
    }),

  unfollowUser: protectedProcedure
    .input(z.object({ accountId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ObjectId.isValid(input.accountId))
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User id is not valid",
        });

      // check if user is following
      const isFollowing = await ctx.prisma.follow.findFirst({
        where: {
          followerId: ctx.session.user.id,
          followingId: input.accountId,
        },
      });

      if (!isFollowing)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is not following",
        });

      const follow = await ctx.prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: ctx.session.user.id,
            followingId: input.accountId,
          },
        },
      });

      return follow;
    }),

  isFollowing: protectedProcedure
    .input(z.object({ accountId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ObjectId.isValid(input.accountId))
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User id is not valid",
        });

      const currentUser = ctx.session.user;

      const follow = await ctx.prisma.follow.findFirst({
        where: {
          followerId: currentUser.id,
          followingId: input.accountId,
        },
      });

      // returns false if user is not following
      // returns true if user is following
      return !!follow;
    }),

  getMyFollows: protectedProcedure.query(async ({ ctx }) => {
    const currentUser = ctx.session.user;

    const follows = await ctx.prisma.follow.findMany({
      where: {
        followerId: currentUser.id,
      },
      select: {
        following: {
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
          },
        },
      },
    });

    return follows;
  }),

  getMyFollowers: protectedProcedure.query(async ({ ctx }) => {
    const currentUser = ctx.session.user;

    const followers = await ctx.prisma.follow.findMany({
      where: {
        followingId: currentUser.id,
      },
      select: {
        follower: {
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
          },
        },
      },
    });

    return followers;
  }),
  getFollowerCount: publicProcedure
    .input(z.object({ accountId: z.string() }))
    .query(async ({ input, ctx }) => {
      const followers = await ctx.prisma.follow.count({
        where: {
          followingId: input.accountId,
        },
      });

      return followers;
    }),

  getFollowingCount: publicProcedure
    .input(z.object({ accountId: z.string() }))
    .query(async ({ input, ctx }) => {
      const followers = await ctx.prisma.follow.count({
        where: {
          followerId: input.accountId,
        },
      });

      return followers;
    }),
  getRecentActivity: protectedProcedure.query(async ({ ctx }) => {
    const follows = await ctx.prisma.follow.findMany({
      where: {
        followerId: ctx.session.user.id,
      },
      select: {
        following: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    const followingIds = follows.map((follow) => follow.following.id);

    if (followingIds.length === 0) return [];

    const posts = await ctx.prisma.article.findMany({
      where: {
        authorId: {
          in: followingIds,
        },
        isPublished: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        slug: true,
        createdAt: true,

        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return posts;
  }),
});
