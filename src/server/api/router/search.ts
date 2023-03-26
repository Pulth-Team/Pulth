import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import algoliaSearch from "algoliasearch";
import { env } from "~/env.mjs";

export const searchRouter = createTRPCRouter({
  article: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input }) => {
      const searchIndex = algoliaSearch(
        env.ALGOLIA_APP_ID,
        env.ALGOLIA_API_KEY
      ).initIndex(env.ALGOLIA_INDEX_NAME);

      return searchIndex.search(input.query).then((res) => {
        return res.hits;
      });
    }),
});
