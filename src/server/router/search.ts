import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

import algoliaSearch from "algoliasearch";
import { env } from "../env.mjs";

export const searchRouter = createRouter().query("article", {
  input: z.object({
    query: z.string(),
  }),
  resolve({ input }) {
    const searchIndex = algoliaSearch(
      env.ALGOLIA_APP_ID,
      env.ALGOLIA_API_KEY
    ).initIndex("article_name");

    searchIndex.search(input.query).then((res) => {
      return res.hits;
    });
  },
});
