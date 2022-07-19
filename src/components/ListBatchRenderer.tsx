// imports GetServerSideProps from nextjs
import { NextPage } from "next";
import Link from "next/link";
import {
  BatchElement,
  ListBatchType,
  BoldData,
  CodeData,
  HighlightData,
  ItalicData,
  LinkData,
  ListBatchElement,
  ParagraphData,
} from "../types/renderer";
import ListRenderer from "./ListRenderer";

// creates a NextFunctionComponent
const ListBatchRenderer: NextPage<{ data: ListBatchElement[] }> = ({
  data,
}) => {
  return (
    <div>
      {data.map((articleBlock, index) => {
        switch (articleBlock.type) {
          case ListBatchType.Paragraph:
            articleBlock.data as ParagraphData;
            return (
              <p className="inline" key={index}>
                {" "}
                {articleBlock.data.text}{" "}
              </p>
            );
          case ListBatchType.Bold:
            articleBlock.data as BoldData;
            return (
              <b className="font-semibold" key={index}>
                {articleBlock.data.text}
              </b>
            );
          case ListBatchType.Italic:
            articleBlock.data as ItalicData;
            return (
              <i className="font-italic" key={index}>
                {articleBlock.data.text}
              </i>
            );
          case ListBatchType.Code:
            articleBlock.data as CodeData;
            return (
              <code
                className="bg-slate-300 px-0.5 mx-0.5 inl  rounded font-mono font-thin "
                key={index}
              >
                {articleBlock.data.text}
              </code>
            );
          case ListBatchType.Highlight:
            articleBlock.data as HighlightData;
            return (
              <mark
                className="bg-yellow-300 rounded mx-0.5 px-0.5 text-black"
                key={index}
              >
                {articleBlock.data.text}
              </mark>
            );
          case ListBatchType.Link:
            articleBlock.data as LinkData;
            return (
              <Link href={articleBlock.data.href} key={index}>
                <a className="underline">{articleBlock.data.text}</a>
              </Link>
            );

          default:
            return (
              <div key={index}>
                <p className="bg-red-200 text-red-500 px-1">
                  {" "}
                  unsupported Type in ListBatchRenderer &quot;
                  {articleBlock.type}&quot;
                </p>
              </div>
            );
        }
      })}
    </div>
  );
};

// exports it
export default ListBatchRenderer;
