import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";

export interface BatchElement {
  // todo add id
  type: BatchType;
  data: any;
}
export enum BatchType {
  Link = "link",
  Bold = "bold",
  Italic = "italic",
  Code = "code",
  Highlight = "highlight",
  Image = "image",
  Quote = "quote",
  List = "list",
  Delimiter = "delimiter",
  Heading = "heading",
  Paragraph = "paragraph",
}

// Newer implementation of the Editor interface

export enum ElementTypes {
  Code = "code",
  Paragraph = "paragraph",
  Heading = "heading",
  Image = "image",
}

type CustomText = { text: string; bold?: true };
interface BaseElement {
  type: ElementTypes;
  children: CustomText[];
}

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: BaseElement | HeadingElement;
    Text: CustomText;
  }
}

interface HeadingElement extends BaseElement {
  type: ElementTypes.Heading;
  data: {
    level: number;
  };
}
