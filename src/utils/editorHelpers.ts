import { unified } from "unified";
import parse from "rehype-parse";
import type { RootContent } from "hast";
import { type } from "os";

interface AST {
  type: "element" | "text";
}
type Point = {
  line: number;
  column: number;
  offset: number;
};

type PureNodeAST = PureElement | PureText;
type NodeAST = Element | Text;

interface PureElement extends AST {
  type: "element";
  tagName: string;
  properties: {
    className?: string[];
    href?: string;
  };
  children: PureNodeAST[];
}

interface PureText extends AST {
  type: "text";
  value: string;
}

interface Element extends PureElement {
  type: "element";
  tagName: string;
  properties: {
    className?: string[];
  };
  children: NodeAST[];
  position: {
    start: Point;
    end: Point;
  };
}

interface Text extends PureText {
  type: "text";
  value: string;
  position: {
    start: Point;
    end: Point;
  };
}

type ValidityError = "Invalid ClassName" | "Invalid TagName";

export const getASTfromHTML = (html: string) => {
  const processor = unified().use(parse, { fragment: true });

  // there is a position property in each node of the AST
  // which is not needed for our use case
  const HtmlAST = processor.parse(html).children;
  for (let index = 0; index < HtmlAST.length; index++) {
    const node = HtmlAST[index];

    deletePositionRecursive(node);
  }

  return HtmlAST as PureNodeAST[];
  // example output
  [
    {
      type: "element",
      tagName: "p",
      properties: {
        className: ["ql-align-center"],
      },
      children: [[Object]],
      position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 27, offset: 26 },
      },
    },
    {
      type: "element",
      tagName: "p",
      properties: {},
      children: [[Object]],
    },
    {
      type: "element",
      tagName: "p",
      properties: {},
      children: [[Object]],
    },
  ];
};

function deletePositionRecursive(node: any) {
  if (node.position) {
    delete node.position;
  }
  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      deletePositionRecursive(node.children[i]);
    }
  }
}

export function ValidateTree(ast: PureNodeAST[]) {
  let results: {
    reason: ValidityError;
    data: { tagName: string; className: string; expected: string };
  }[] = [];
  for (let index = 0; index < ast.length; index++) {
    const node = ast[index];
    console.log("called");
    if (node?.type === "text") continue;

    if (node?.type === "element") {
      console.log(node);
      const result = ValidateNode(node);
      if (result) {
        results.push(result);
        console.log(results, "results");
      }
      if (node.children) {
        results = [...results, ...ValidateTree(node.children)];
      }
    }
  }

  console.log(results, "results Final");
  return results;
}

function ValidateNode(node: PureNodeAST):
  | {
      reason: ValidityError;
      data: { tagName: string; className: string; expected: string };
    }
  | undefined {
  // check if ast is valid
  const validElementsMap = [
    { type: "code", class: "inline-code" },
    { type: "i", class: "a" },
    { type: "mark", class: "cdx-marker" },
  ];

  const ValidElementsType = ["code", "i", "mark"];
  const ValidElementsClass = ["inline-code", "a", "cdx-marker"];

  if (node.type === "element") {
    if (!ValidElementsType.includes(node.tagName)) {
      return {
        reason: "Invalid TagName",
        data: {
          tagName: node.tagName,
          className: "",
          expected: ValidElementsType.join(", "),
        },
      };
    }

    const tagNameIndex = ValidElementsType.indexOf(node.tagName);
    if (
      ValidElementsClass[tagNameIndex] !==
      (node.properties.className !== undefined
        ? node.properties.className.join("")
        : "")
    ) {
      return {
        reason: "Invalid ClassName",
        data: {
          className:
            node.properties.className !== undefined &&
            node.properties.className[0] !== undefined
              ? node.properties.className[0]
              : " ",
          tagName: "",
          expected: ValidElementsClass[tagNameIndex] || " ",
        },
      };
    }
  }
  return undefined;
}

export type { PureNodeAST, NodeAST, PureElement, PureText, Element, Text };
