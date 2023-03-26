import { z } from "zod";
import { ObjectId } from "bson";

import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getUserById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ObjectId.isValid(input.id))
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User id is not valid",
        });

      const user = await ctx.prisma?.user.findUnique({
        where: {
          id: input.id,
        },
        select: {
          name: true,
          email: true,
          image: true,
          id: true,
          description: true,
          Articles: {
            select: {
              id: true,
              title: true,
              description: true,
              slug: true,
              createdAt: true,
              updatedAt: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });
      return user;
    }),

  updateUserById: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          image: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ObjectId.isValid(input.id))
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User id is not valid",
        });

      const updatedUser = await ctx.prisma?.user.update({
        where: {
          id: input.id.toString(),
        },
        data: {
          name: input.data.name ?? undefined,
          description: input.data.description ?? undefined,
          image: input.data.image ?? undefined,
        },
      });
      return updatedUser;
    }),
});
