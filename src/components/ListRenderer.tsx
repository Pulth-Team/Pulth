// imports GetServerSideProps from nextjs
import { NextPage } from "next";
import { ListBatchElement, ListData } from "../types/renderer";
import ListBatchRenderer from "./ListBatchRenderer";

// creates a NextFunctionComponent
const ListRenderer: NextPage<{ data: ListData }> = ({ data }) => {
  console.log(data);
  // return a jsx list
  return (
    <ul className="px-4">
      {data.items.map((ListBatchBlock, index) => {
        return (
          <li
            key={index}
            className={`${data.isOrdered ? "list-decimal" : "list-disc"}`}
          >
            <ListBatchRenderer data={ListBatchBlock} />
          </li>
        );
      })}
    </ul>
  );
};

// exports it
export default ListRenderer;
