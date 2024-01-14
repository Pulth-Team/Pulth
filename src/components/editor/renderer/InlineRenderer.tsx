import Link from "next/link";
import { NextPage } from "next";
import { ReactNode, useMemo } from "react";
import { getASTfromHTML, PureNodeAST } from "~/utils/editorHelpers";

type InlineRendererProps = {
  text: string;
  keySeed?: string;
};

const InlineRenderer: NextPage<InlineRendererProps> = ({ text }) => {
  const InlineASTMemo = useMemo(() => {
    let ast = getASTfromHTML(text);

    ast = ast.filter(
      (node) =>
        (node.type == "element" && node.tagName !== "br") || node.type == "text"
    );

    function InlineRendererAST({ ast }: { ast: PureNodeAST[] }) {
      const elementArray = ast.map((node, index) => {
        if (node.type == "text") return <span key={index}>{node.value}</span>;

        switch (node.tagName) {
          case "b":
            return (
              <span key={index} className="font-bold">
                <InlineRendererAST ast={node.children} />
              </span>
            );
          case "br":
            console.error(node);
            return <br/>;
          case "i":
            return (
              <span key={index} className="italic">
                <InlineRendererAST ast={node.children} />
              </span>
            );
          case "a":
            return (
              <Link key={index} href={node.properties.href as string}>
                <span className="cursor-pointer underline">
                  <InlineRendererAST ast={node.children} />
                </span>
              </Link>
            );
          default:
            console.log(node);
            return (
              <span key={index} className="bg-gray-700 p-1 text-white ">
                Unsupported element type {node.tagName}
              </span>
            );
        }
      });

      return <>{elementArray}</>;
    }

    return <InlineRendererAST ast={ast} />;
  }, [text]);

  return <span>{InlineASTMemo}</span>;
};

export default InlineRenderer;
