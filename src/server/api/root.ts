import { createTRPCRouter } from "~/server/api/trpc";

import { searchRouter } from "./router/search";
import { userRouter } from "./router/user";
import { commentRouter } from "./router/comment";
import { articleRouter } from "./router/article";
import { authRouter } from "./router/auth";
import { voteRouter } from "./router/vote";
import { followSystemRouter } from "./router/followSystem";
import { tagRouter } from "./router/tag";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  search: searchRouter,
  user: userRouter,
  comment: commentRouter,
  article: articleRouter,
  auth: authRouter,
  vote: voteRouter,
  followSystem: followSystemRouter,
  tag: tagRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
