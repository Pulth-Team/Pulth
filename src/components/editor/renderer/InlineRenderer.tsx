import { NextPage } from "next";
import type { ReactNode } from "react";
import { getASTfromHTML, PureNodeAST } from "../../../utils/editorHelpers";

type InlineRendererProps =
  | {
      text?: never;
      ast: PureNodeAST[];
      keySeed?: string;
    }
  | {
      text: string;
      ast?: never;
      keySeed?: string;
    };

const InlineRenderer: NextPage<InlineRendererProps> = ({
  text,
  ast,
  keySeed = "inline-renderer-",
}) => {
  if (ast)
    return (
      <>
        {ast.map((node, index) => {
          switch (node.type) {
            case "text":
              return <span key={keySeed + index}>{node.value}</span>;
            case "element":
              switch (node.tagName) {
                case "b":
                  keySeed += "-bold-" + index;
                  return (
                    <span key={index} className="font-bold">
                      <InlineRenderer ast={node.children} keySeed={keySeed} />
                    </span>
                  );
                case "i":
                  keySeed += "-italic-" + index;

                  return (
                    <span key={index} className="italic">
                      <InlineRenderer ast={node.children} keySeed={keySeed} />
                    </span>
                  );
                case "br":
                  keySeed += "-br-" + index;
                  return (
                    <span key={index} className="text-gray-500 text-sm">
                      <br />
                    </span>
                  );

                default:
                  return (
                    <span
                      key={index}
                      className="bg-red-700 text-white p-1 rounded"
                    >
                      unknown inline tool {node.tagName}
                    </span>
                  );
              }
          }
        })}
      </>
    );
  else {
    ast = getASTfromHTML(text);
    return <InlineRenderer ast={ast} />;
  }
};

export default InlineRenderer;
