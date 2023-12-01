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

      // if the name is updated, update the session
      if (input.name) {
        ctx.session.user.name = updatedUser.name;
        const { algolia } = ctx;

        // get user's published articles

        const publishedArticles = await ctx.prisma?.article.findMany({
          where: {
            authorId: ctx.session?.user?.id,
            isPublished: true,
          },
          select: {
            id: true,
          },
        });

        // create an array of objects for algolia
        const objects = publishedArticles?.map((article) => ({
          objectID: article.id,
          author: {
            name: updatedUser.name,
            image: updatedUser.image,
            id: updatedUser.id,
          },
        }));

        // update objects in algolia
        await algolia.partialUpdateObjects(objects, {
          createIfNotExists: false,
        });
      }

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
