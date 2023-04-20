import { OutputBlockData } from "@editorjs/editorjs";
import { NextPage } from "next";

import HeaderRenderer from "./HeaderRenderer";
import ImageRenderer from "./ImageRenderer";
import InlineRenderer from "./InlineRenderer";
import ListRenderer from "./ListRenderer";

interface BlockData {
  type: string;
  // data property is not defined in the type
  // so I will define it as any
  data: any;
  id: string;
}

interface HeaderBlockData extends BlockData {
  type: "header";
  data: {
    text: string;
    level: number;
  };
}

interface ParagraphBlockData extends BlockData {
  type: "paragraph";
  data: {
    text: string;
  };
}

interface ListBlockData extends BlockData {
  type: "list";
  data: {
    style: "ordered" | "unordered";
    items: string[];
  };
}
interface ImageBlockData extends BlockData {
  type: "Image";
  data: {
    file: {
      url: string;
    };
    caption: string;
  };
}

export type OutputBlockType =
  | HeaderBlockData
  | ParagraphBlockData
  | ListBlockData
  | ImageBlockData;

//
// Document renderer takes in a list of blocks and renders them
//
// TODO: Add support for React Suspense
//    - Suspense is neded because rendering the document is a heavy task
//    - and we need to render it on suspense (in the client side)
//    - so we can show a loading indicator. In the server side,
//    - we are already rendering the document so we don't need to use suspense.
//    - https://reactjs.org/docs/concurrent-mode-suspense.html
//
// TODO: Add support for React Error Boundaries
//    - https://reactjs.org/docs/error-boundaries.html

const DocumentRenderer: NextPage<{
  blocks: OutputBlockType[];
}> = ({ blocks }) => {
  let keySeed = "document-renderer-";

  return (
    <div>
      {blocks.map((block) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p key={keySeed + block.id}>
                <InlineRenderer text={block.data.text} />
              </p>
            );
          case "header":
            return (
              <HeaderRenderer
                key={keySeed + block.id}
                level={block.data.level}
                text={block.data.text}
              />
            );
          case "list":
            return (
              <ListRenderer
                key={keySeed + block.id}
                isOrdered={block.data.style === "ordered"}
                items={block.data.items}
              />
            );
          case "Image":
            return (
              <ImageRenderer
                key={keySeed + block.id}
                url={block.data.file.url}
                caption={block.data.caption}
              />
            );
        }
      })}
    </div>
  );
};
export default DocumentRenderer;
