// imports GetServerSideProps from nextjs
import { NextPage } from "next";
import Link from "next/link";
import { BatchElement } from "../types/renderer";
import BatchRenderer from "./BatchRenderer";

// creates a NextFunctionComponent
const DocumentRenderer: NextPage<{ data: BatchElement[][] }> = ({ data }) => {
  return (
    <div className="flex flex-col gap-3">
      {data.map((BatchBlock, index) => {
        return <BatchRenderer data={BatchBlock} key={index} />;
      })}
    </div>
  );
};

// exports it
export default DocumentRenderer;
