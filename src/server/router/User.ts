import { createRouter } from "./context";
import { z } from "zod";
import { ObjectId } from "bson";
import { TRPCAbortError } from "@trpc/client";
import { TRPCError } from "@trpc/server";

export const UserRouter = createRouter()
  .query("getUserById", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      if (!ObjectId.isValid(input.id))
        return new TRPCError({
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
    },
  })
  .mutation("updateUserById", {
    input: z.object({
      id: z.string(),
      data: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
      }),
    }),
    async resolve({ input, ctx }) {
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
    },
  });
