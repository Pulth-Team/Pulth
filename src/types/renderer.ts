export interface BatchElement {
  // todo add id
  type: BatchType;
  data: any;
}

export interface ListBatchElement {
  type: ListBatchType;
  data: any;
}

export enum ListBatchType {
  Link = "link",
  Bold = "bold",
  Italic = "italic",
  Code = "code",
  Highlight = "highlight",
  Paragraph = "paragraph",
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

export interface LinkData {
  href: string;
  text: string;
}
export interface BoldData {
  text: string;
}
export interface ItalicData {
  text: string;
}
export interface CodeData {
  text: string;
}
export interface HighlightData {
  text: string;
}
export interface ImageData {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface QuoteData {
  text: string;
}
export interface ListData {
  isOrdered: boolean;
  items: ListBatchElement[][];
}

export interface HeadingData {
  text: string;
  level: number;
}
export interface ParagraphData {
  text: string;
}
