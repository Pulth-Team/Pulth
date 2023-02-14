import { NextPage } from "next";
import { ReactNode, useMemo } from "react";
import { getASTfromHTML, PureNodeAST } from "../../../utils/editorHelpers";

type InlineRendererProps = {
  text: string;
  keySeed?: string;
};

const InlineRenderer: NextPage<InlineRendererProps> = ({ text }) => {
  console.count("InlineRenderer");

  const InlineASTMemo = useMemo(() => {
    let ast = getASTfromHTML(text);

    ast = ast.filter(
      (node) =>
        (node.type == "element" && node.tagName !== "br") || node.type == "text"
    );

    function InlineRendererAST({ ast }: { ast: PureNodeAST[] }) {
      const elementArray = ast.map((node, index) => {
        switch (node.type) {
          case "text":
            return <span key={index}>{node.value}</span>;
          case "element":
            switch (node.tagName) {
              case "b":
                return (
                  <span key={index} className="font-bold">
                    <InlineRendererAST ast={node.children} />
                  </span>
                );
              case "i":
                return (
                  <span key={index} className="italic">
                    <InlineRendererAST ast={node.children} />
                  </span>
                );
            }
        }
      });

      return <>{elementArray}</>;
    }

    return <InlineRendererAST ast={ast} />;
  }, [text]);

  return <span>{InlineASTMemo}</span>;
};

export default InlineRenderer;
