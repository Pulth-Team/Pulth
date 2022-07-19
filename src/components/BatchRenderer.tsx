// imports GetServerSideProps from nextjs
import { NextPage } from "next";
import Link from "next/link";
import {
  BatchElement,
  BatchType,
  BoldData,
  CodeData,
  HighlightData,
  ItalicData,
  LinkData,
  ParagraphData,
} from "../types/renderer";

// creates a NextFunctionComponent
const BatchRenderer: NextPage<{ data: BatchElement[] }> = ({ data }) => {
  return (
    <>
      {data.map((articleBlock) => {
        switch (articleBlock.type) {
          case BatchType.Paragraph:
            articleBlock.data as ParagraphData;
            return <p className="inline"> {articleBlock.data.text} </p>;
          case BatchType.Bold:
            articleBlock.data as BoldData;
            return <b className="font-semibold">{articleBlock.data.text}</b>;
          case BatchType.Italic:
            articleBlock.data as ItalicData;
            return <i className="font-italic">{articleBlock.data.text}</i>;
          case BatchType.Code:
            articleBlock.data as CodeData;
            return (
              <code className="bg-slate-300 px-0.5 mx-0.5 inl  rounded font-mono font-thin ">
                {articleBlock.data.text}
              </code>
            );
          case BatchType.Highlight:
            articleBlock.data as HighlightData;
            return (
              <mark className="bg-yellow-300 rounded mx-0.5 px-0.5 text-black">
                {articleBlock.data.text}
              </mark>
            );
          case BatchType.Link:
            articleBlock.data as LinkData;
            return (
              <Link href={articleBlock.data.href}>
                <a className="underline">{articleBlock.data.text}</a>
              </Link>
            );
        }
      })}
    </>
  );
};

// exports it
export default BatchRenderer;
