// imports GetServerSideProps from nextjs
import { NextPage } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  BatchElement,
  BatchType,
  BoldData,
  CodeData,
  HighlightData,
  ImageData,
  ItalicData,
  LinkData,
  ListBatchElement,
  ParagraphData,
} from "../types/renderer";
import ListRenderer from "./ListRenderer";

// creates a NextFunctionComponent
const BatchRenderer: NextPage<{ data: BatchElement[] }> = ({ data }) => {
  return (
    <div>
      {data.map((articleBlock, index) => {
        switch (articleBlock.type) {
          case BatchType.Paragraph:
            articleBlock.data as ParagraphData;
            return (
              <p className="inline" key={index}>
                {" "}
                {articleBlock.data.text}{" "}
              </p>
            );
          case BatchType.Bold:
            articleBlock.data as BoldData;
            return (
              <b className="font-semibold" key={index}>
                {articleBlock.data.text}
              </b>
            );
          case BatchType.Italic:
            articleBlock.data as ItalicData;
            return (
              <i className="font-italic" key={index}>
                {articleBlock.data.text}
              </i>
            );
          case BatchType.Code:
            articleBlock.data as CodeData;
            return (
              <code
                className="bg-slate-300 px-0.5 mx-0.5 inl  rounded font-mono font-thin "
                key={index}
              >
                {articleBlock.data.text}
              </code>
            );
          case BatchType.Highlight:
            articleBlock.data as HighlightData;
            return (
              <mark
                className="bg-yellow-300 rounded mx-0.5 px-0.5 text-black"
                key={index}
              >
                {articleBlock.data.text}
              </mark>
            );
          case BatchType.Link:
            articleBlock.data as LinkData;
            return (
              <Link href={articleBlock.data.href} key={index}>
                <a className="underline">{articleBlock.data.text}</a>
              </Link>
            );

          case BatchType.Heading:
            switch (articleBlock.data.level) {
              case 1:
                return (
                  <h1 className="text-3xl font-bold" key={index}>
                    {articleBlock.data.text}
                  </h1>
                );

              case 2:
                return (
                  <h2 className="text-2xl font-bold" key={index}>
                    {articleBlock.data.text}
                  </h2>
                );
              case 3:
                return (
                  <h3 className="text-xl font-bold" key={index}>
                    {articleBlock.data.text}
                  </h3>
                );
              case 4:
                return (
                  <h4 className="text-lg font-bold" key={index}>
                    {articleBlock.data.text}
                  </h4>
                );
              case 5:
                return (
                  <h5 className="text-md font-bold" key={index}>
                    {articleBlock.data.text}
                  </h5>
                );
              case 6:
                return (
                  <h6 className="text-sm font-bold" key={index}>
                    {articleBlock.data.text}
                  </h6>
                );
              default:
                return (
                  <div key={index}>
                    <p className="bg-red-200 text-red-500 px-1">
                      {" "}
                      unsupported level for heading &quot;{articleBlock.type}
                      &quot;
                    </p>
                  </div>
                );
            }

          case BatchType.List:
            articleBlock.data as ListBatchElement[];
            return <ListRenderer data={articleBlock.data} key={index} />;
          case BatchType.Delimiter:
            articleBlock.data as undefined;
            return (
              <div
                key={index}
                className="before:inline-block before:content-['***']  before:text-3xl before:leading-10 before:h-10 before:tracking-widest align-middle text-center w-full leading-5"
              ></div>
            );
          case BatchType.Image:
            articleBlock.data as ImageData;
            return (
              <div className="w-full h-64 relative">
                <Image
                  layout="fill"
                  src={articleBlock.data.src}
                  alt={articleBlock.data.alt}
                  width={articleBlock.data.width}
                  height={articleBlock.data.height}
                  objectFit="contain"
                  className="bg-slate-500 w-4"
                />
              </div>
            );

          default:
            return (
              <div key={index}>
                <p className="bg-red-200 text-red-500 px-1">
                  {" "}
                  unsupported Type {articleBlock.type}
                </p>
              </div>
            );
        }
      })}
    </div>
  );
};

// exports it
export default BatchRenderer;
