// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { authRouter } from "./auth";
import { ArticleRouter } from "./Article";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("auth.", authRouter)
  .merge("article.", ArticleRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
