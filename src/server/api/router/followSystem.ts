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

      if (currentUser.id === input.accountId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot follow yourself",
        });
      }
      //checks if user is already following
      const isFollowing = await ctx.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId: input.accountId,
          },
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

  getFollows: protectedProcedure.input(z.object({
    accountId: z.string(),

  })).query(async ({ ctx, input }) => {

    const follows = await ctx.prisma.follow.findMany({
      where: {
        followerId: input.accountId,
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

    const followList = follows.map((follow) => follow.following);

    return followList;
  }),

  getFollowers: protectedProcedure.input(z.object({
    accountId: z.string(),
  })).query(async ({ ctx , input}) => {

    const followers = await ctx.prisma.follow.findMany({
      where: {
        followingId: input.accountId,
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

    console.log(followers);

    const followersList = followers.map((follow) => follow.follower);

    return followersList;
  }),

  removeFollower: protectedProcedure.input(z.object({accountId: z.string()})).mutation(async ({ ctx, input }) => {
    const follower = await ctx.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followingId: ctx.session.user.id,
          followerId: input.accountId,
        },
      },
    });

    return follower;
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
