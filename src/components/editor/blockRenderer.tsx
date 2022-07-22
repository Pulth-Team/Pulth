import type { NextPage } from "next";

import { useState } from "react";

import {
  PlusIcon,
  DotsVerticalIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  XIcon,
} from "@heroicons/react/solid";

import { RenderElementProps, useFocused, useSlate } from "slate-react";
import { Popover } from "@headlessui/react";

import DefaultElement from "./DefaultElement";
import HeadingElement from "./HeadingElement";

import { Editor, Node, Transforms } from "slate";
import { ElementTypes } from "../../types/renderer";

const BlockRenderer = (props: RenderElementProps) => {
  const ComponentRenderElement = (prop: { className: string }) => {
    switch (props.element.type) {
      case "heading":
        return <HeadingElement props={props} className={prop.className} />;
      case "paragraph":
        return <DefaultElement props={props} className={prop.className} />;

      default:
        return <div> unknown type {props.element.type}</div>;
    }
  };

  const editor = useSlate();

  // const getDocument = () => Array.from(Node.elements(editor));
  const isCurrentElement = () => getFocusedElement() === props.element;
  const getFocusedElement = () => {
    return editor.children[editor.selection?.anchor.path[0]!];
  };
  const getFocusedProps = () => {
    return {
      element: editor.children[editor.selection?.anchor.path[0]!],
      anchor: editor.selection?.anchor,
    };
  };

  let tabProps = isCurrentElement() ? { tabIndex: 0 } : { tabIndex: -1 };
  return (
    <div className="flex flex-row gap-2">
      <Popover.Group className="flex flex-nowrap gap-1">
        <Popover className="relative">
          <Popover.Button
            disabled={!isCurrentElement()}
            className={`p-1 ${
              isCurrentElement() ? "hover:bg-slate-200" : ""
            } rounded `}
          >
            <PlusIcon
              className={`
              w-5 h-5 flex-shrink-0
              ${isCurrentElement() ? "opacity-100" : "opacity-0 "}`}
              {...tabProps}
            />
          </Popover.Button>

          <Popover.Panel
            className="absolute z-10 bg-white p-1 rounded shadow select-none"
            contentEditable={false}
          >
            {/* Add Icons for Ponel Items */}
            <div className="m-1 p-1 text-sm font-medium hover:bg-slate-100 active:bg-slate-200 rounded">
              <p>Heading</p>
            </div>
            <div className="m-1 p-1 text-sm font-medium hover:bg-slate-100 active:bg-slate-200 rounded">
              <p>Paragraph</p>
            </div>
          </Popover.Panel>
        </Popover>
        <Popover className="relative ">
          <Popover.Button
            disabled={!isCurrentElement()}
            className={`py-1 ${
              isCurrentElement() ? "hover:bg-slate-200" : ""
            } rounded `}
          >
            <DotsVerticalIcon
              className={`
              w-5 h-5 flex-shrink-0
              ${isCurrentElement() ? "opacity-100" : "opacity-0 "}`}
              {...tabProps}
            />
          </Popover.Button>
          <Popover.Panel
            className={`absolute z-10 -translate-x-10`}
            contentEditable={false}
          >
            <div className=" bg-white shadow  flex grid-cols-3 gap-1 w-full rounded ">
              <div
                className="m-1 p-1 hover:bg-slate-100 active:bg-slate-200 rounded"
                onClick={() => {
                  const elementCount = editor.children.length;
                  const toPosition =
                    editor.selection?.anchor.path[0]! === elementCount - 1
                      ? elementCount - 1
                      : editor.selection?.anchor.path[0]! + 1;
                  Transforms.moveNodes(editor, {
                    at: getFocusedProps().anchor,
                    to: [toPosition],
                  });
                }}
              >
                <ArrowDownIcon className="w-5 h-5" />
              </div>
              <div
                className="m-1  p-1 hover:bg-slate-100 active:bg-slate-200 rounded"
                onClick={() => {
                  Transforms.removeNodes(editor, {
                    at: getFocusedProps().anchor,
                  });
                }}
              >
                <XIcon className="w-5 h-5" />
              </div>
              <div
                className="m-1  p-1 hover:bg-slate-100 active:bg-slate-200 rounded"
                onClick={() => {
                  const toPosition =
                    editor.selection?.anchor.path[0]! === 0
                      ? 0
                      : editor.selection?.anchor.path[0]! - 1;
                  Transforms.moveNodes(editor, {
                    at: getFocusedProps().anchor,
                    to: [toPosition],
                  });
                }}
              >
                <ArrowUpIcon className="w-5 h-5" />
              </div>
            </div>
          </Popover.Panel>
        </Popover>
      </Popover.Group>

      <ComponentRenderElement className={"flex-grow-0 w-full"} />
    </div>
  );
};

export default BlockRenderer;
