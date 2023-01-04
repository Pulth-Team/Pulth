// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { authRouter } from "./auth";
import { ArticleRouter } from "./Article";
import { searchRouter } from "./search";
import { UserRouter } from "./User";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("auth.", authRouter)
  .merge("article.", ArticleRouter)
  .merge("search.", searchRouter)
  .merge("user.", UserRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
