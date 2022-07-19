import { createRouter } from "./context";
import { z } from "zod";

// returns a router with the batch data route
export const ArticleRouter = createRouter().query("batch-data", {
  resolve() {
    return [
      {
        type: "paragraph",
        isEnding: false,
        data: {
          text: "This is a paragraph",
        },
      },
      {
        type: "bold",
        isEnding: false,
        data: {
          text: "and a bold text",
        },
      },
      {
        type: "paragraph",
        isEnding: true,
        data: {
          text: "This is a paragraph again",
        },
      },
    ];
  },
});
