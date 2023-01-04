import { createRouter } from "./context";
import { z } from "zod";

export const UserRouter = createRouter().query("getUserById", {
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
      },
    });
    return user;
  },
});
