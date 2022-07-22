import type { NextPage } from "next";

import { RenderElementProps, useSlate } from "slate-react";
import { Transforms } from "slate";
import { ElementTypes } from "../../types/renderer";

const HeadingElement: NextPage<{
  props: RenderElementProps;
  className: string;
}> = ({ props, className }) => {
  const editor = useSlate();

  if (props.element.type !== ElementTypes.Heading)
    return (
      <div className="col-span-6">
        Wrong type expecting {ElementTypes.Heading} but got {props.element.type}
      </div>
    );

  return (
    <>
      <div
        className="col-span-2 p-1 m-1 hover:bg-slate-100 active:bg-slate-200 rounded select-none "
        onClick={() => {
          Transforms.setNodes(editor, {
            data: { level: 1 },
          });
        }}
      >
        H1
      </div>
      <div
        className="col-span-2 p-1 m-1 hover:bg-slate-100 active:bg-slate-200 rounded select-none "
        onClick={() => {
          Transforms.setNodes(editor, {
            data: { level: 2 },
          });
        }}
      >
        H2
      </div>
      <div
        className="col-span-2 p-1 m-1 hover:bg-slate-100 active:bg-slate-200 rounded select-none "
        onClick={() => {
          Transforms.setNodes(editor, {
            data: { level: 3 },
          });
        }}
      >
        H3
      </div>
      <div
        className="col-span-2 p-1 m-1 hover:bg-slate-100 active:bg-slate-200 rounded select-none "
        onClick={() => {
          Transforms.setNodes(editor, {
            data: { level: 4 },
          });
        }}
      >
        H4
      </div>
      <div
        className="col-span-2 p-1 m-1 hover:bg-slate-100 active:bg-slate-200 rounded select-none "
        onClick={() => {
          Transforms.setNodes(editor, {
            data: { level: 5 },
          });
        }}
      >
        H5
      </div>
      <div
        className="col-span-2 p-1 m-1 hover:bg-slate-100 active:bg-slate-200 rounded select-none "
        onClick={() => {
          Transforms.setNodes(editor, {
            data: { level: 6 },
          });
        }}
      >
        H6
      </div>
    </>
  );
};

export default HeadingElement;
