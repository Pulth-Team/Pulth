import { BaseEditor, Node } from "slate";
import { ReactEditor, RenderElementProps } from "slate-react";

export const getDocument = (editor: BaseEditor & ReactEditor) =>
  Array.from(Node.elements(editor));

export const isCurrentElement = (
  editor: BaseEditor & ReactEditor,
  props: RenderElementProps
) => getFocusedElement(editor) === props.element;

export const getFocusedElement = (editor: BaseEditor & ReactEditor) => {
  if (editor.selection?.anchor.path[0] !== undefined)
    return editor.children[editor.selection?.anchor.path[0]];
  else return undefined;
};

export const getFocusedProps = (editor: BaseEditor & ReactEditor) => {
  return {
    element: editor.children[editor.selection?.anchor.path[0]!],
    anchor: editor.selection?.anchor,
  };
};
