import { EndEventFilterSensitiveLog } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const authRouter = createTRPCRouter({
  getSettings: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma?.user.findUnique({
      where: {
        id: ctx.session?.user?.id,
      },
      select: {
        name: true,
        description: true,
        image: true,
        id: true,
        email: true,
      },
    });
  }),

  updateSettings: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        // todo Add Photo Change
        // "photo": z.string().optional()
        // Todo Add change Email for credential Provider
      })
    )
    .mutation(async ({ input, ctx }) => {
      // check if name or description is empty
      if (!input.name && !input.description) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Name or Description is required",
        });
      }

      const updatedUser = await ctx.prisma?.user.update({
        where: {
          id: ctx.session?.user?.id,
        },
        data: {
          name: input.name ?? undefined,
          description: input.description ?? undefined,
        },
      });

      return updatedUser ? "Updated" : "Something went wrong while updating";
    }),

  // getSettings: protectedProcedure({
  //   async resolve({ ctx }) {
  //     const user = await ctx.prisma?.user.findUnique({
  //       where: {
  //         id: ctx.session?.user?.id,
  //       },
  //       select: {
  //         name: true,
  //         description: true,
  //         image: true,
  //         id: true,
  //         email: true,
  //       },
  //     });
  //     return user;
  //   },
  // }),
});
