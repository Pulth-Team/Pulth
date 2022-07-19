import { createRouter } from "./context";
import { z } from "zod";

// returns a router with the batch data route
export const ArticleRouter = createRouter().query("batch-data", {
  resolve() {
    return [
      {
        type: "paragraph",
        data: {
          text: "This is a paragraph",
        },
      },
      {
        type: "bold",
        data: {
          text: "and a bold text",
        },
      },
      {
        type: "paragraph",
        data: {
          text: "This is a paragraph again",
        },
      },
      {
        type: "italic",
        data: {
          text: "with an italic text",
        },
      },
      {
        type: "paragraph",
        data: {
          text: "This is a more paragraph again",
        },
      },
      {
        type: "code",
        data: {
          text: "//with an inline code",
        },
      },
      {
        type: "highlight",
        data: {
          text: "with a highlight",
        },
      },
      {
        type: "link",
        data: {
          href: "https://www.google.com",
          text: "and link to unknown website",
        },
      },
    ];
  },
});
