import { createRouter } from "./context";
import { z } from "zod";
import { BatchElement } from "../../types/renderer";

// returns a router with the batch data route
export const ArticleRouter = createRouter()
  .query("batch-data", {
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
      ] as BatchElement[];
    },
  })
  .query("document-data", {
    resolve() {
      return [
        [
          {
            type: "heading",
            data: {
              text: "This is a heading",
              level: 1,
            },
          },
        ],
        [
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
        ],
        [
          {
            type: "list",
            data: {
              items: [
                [{ type: "paragraph", data: { text: "This is a paragraph" } }],
                [
                  { type: "paragraph", data: { text: "This is a paragraph" } },
                  { type: "code", data: { text: "console.log()" } },
                ],
                [{ type: "paragraph", data: { text: "This is a paragraph" } }],
              ],
              isOrdered: false,
            },
          },
        ],
        [
          {
            type: "paragraph",
            data: {
              text: "This is the one liner paragraph block",
            },
          },
        ],
        [{ type: "delimiter" }],
        [
          {
            type: "image",
            data: {
              src: "https://via.placeholder.com/300x200.png",
              alt: "This is an image",
              width: 300,
              height: 200,
            },
          },
        ],
      ] as BatchElement[][];
    },
  });
