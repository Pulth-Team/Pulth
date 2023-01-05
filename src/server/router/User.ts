import { createRouter } from "./context";
import { z } from "zod";

export const UserRouter = createRouter()
  .query("getUserById", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
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
        },
      });
      return user;
    },
  })
  .query("updateUserById", {
    input: z.object({
      id: z.string(),
      data: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
      }),
    }),
    async resolve({ input, ctx }) {
      const updatedUser = await ctx.prisma?.user.update({
        where: {
          id: input.id,
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
