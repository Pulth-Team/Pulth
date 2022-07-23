import type { NextPage } from "next";

import { useEffect, useState } from "react";

import {
  PlusIcon,
  DotsVerticalIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  XIcon,
} from "@heroicons/react/solid";

import {
  ReactEditor,
  RenderElementProps,
  useFocused,
  useSlate,
} from "slate-react";
import { Popover } from "@headlessui/react";

import DefaultElement from "./DefaultElement";
import HeadingElement from "./HeadingElement";

import HeadingSettings from "./HeadingSettings";

import { Transforms } from "slate";
import { ElementTypes } from "../../types/renderer";

import { getFocusedProps, isCurrentElement } from "../../utils/editorHelpers";

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

  const SettingsRenderElement = () => {
    switch (props.element.type) {
      case ElementTypes.Heading:
        return <HeadingSettings props={props} className="" />;
      default:
        return;
    }
  };
  const editor = useSlate();

  const [isError, setIsError] = useState(false);

  useEffect(() => {
    var timeout = setTimeout(() => {
      setIsError(false);
    }, 200);
    return () => {
      clearTimeout(timeout);
    };
  }, [isError]);

  let tabProps = isCurrentElement(editor, props)
    ? { tabIndex: 0 }
    : { tabIndex: -1 };
  return (
    <span className="flex flex-row gap-2">
      <Popover.Group className="flex flex-nowrap gap-1 self-center">
        <Popover className="relative" contentEditable={false}>
          <Popover.Button
            disabled={!isCurrentElement(editor, props)}
            className={`p-1 ${
              isCurrentElement(editor, props) ? "hover:bg-slate-200" : ""
            } rounded `}
          >
            <PlusIcon
              className={`
              w-5 h-5 flex-shrink-0
              ${
                isCurrentElement(editor, props) ? "opacity-100" : "opacity-0 "
              }`}
              {...tabProps}
            />
          </Popover.Button>

          <Popover.Panel
            className="absolute z-10 bg-white p-1 rounded shadow select-none"
            contentEditable={false}
          >
            {/* Add Icons for Ponel Items */}
            <div
              className="m-1 p-1 text-sm font-medium hover:bg-slate-100 active:bg-slate-200 rounded"
              onClick={() => {
                Transforms.setNodes(editor, {
                  type: ElementTypes.Heading,
                  data: {
                    level: 1,
                  },
                });
              }}
            >
              <p>Heading</p>
            </div>
            <div
              className="m-1 p-1 text-sm font-medium hover:bg-slate-100 active:bg-slate-200 rounded"
              onClick={() => {
                Transforms.setNodes(editor, {
                  type: ElementTypes.Paragraph,
                });
              }}
            >
              <p>Paragraph</p>
            </div>
          </Popover.Panel>
        </Popover>
        <Popover className="relative" contentEditable={false}>
          <Popover.Button
            disabled={!isCurrentElement(editor, props)}
            className={`py-1 ${
              isCurrentElement(editor, props) ? "hover:bg-slate-200" : ""
            } rounded `}
          >
            <DotsVerticalIcon
              className={`
              w-5 h-5 flex-shrink-0
              ${
                isCurrentElement(editor, props) ? "opacity-100" : "opacity-0 "
              }`}
              {...tabProps}
            />
          </Popover.Button>
          <Popover.Panel
            className={`absolute z-10 -translate-x-10`}
            contentEditable={false}
          >
            <div
              className=" bg-white shadow  grid grid-cols-6 gap-1 w-max rounded "
              contentEditable={false}
            >
              {SettingsRenderElement()}

              <div
                className="p-1 m-1 col-span-2 hover:bg-slate-100 active:bg-slate-200 rounded"
                onClick={() => {
                  // needs inspectation more !!
                  ReactEditor.focus(editor);
                  const elementCount = editor.children.length;
                  const toPosition =
                    editor.selection?.anchor.path[0]! === elementCount - 1
                      ? elementCount - 1
                      : editor.selection?.anchor.path[0]! + 1;
                  Transforms.moveNodes(editor, {
                    at: getFocusedProps(editor).anchor,
                    to: [toPosition],
                  });
                }}
                contentEditable={false}
              >
                <ArrowDownIcon className="w-5 h-5 " />
              </div>
              <div
                className={`p-1 m-1 col-span-2 hover:bg-slate-100 active:bg-slate-200 rounded ${
                  isError ? "animate-shake" : "animate-none"
                }`}
                onClick={() => {
                  if (isError) return;

                  if (editor.children.length > 1)
                    Transforms.removeNodes(editor, {
                      at: getFocusedProps(editor).anchor,
                    });
                  else setIsError(true);
                }}
                contentEditable={false}
              >
                <XIcon className="w-5 h-5 " />
              </div>
              <div
                className="p-1 m-1 col-span-2 hover:bg-slate-100 active:bg-slate-200 rounded"
                onClick={() => {
                  const toPosition =
                    editor.selection?.anchor.path[0]! === 0
                      ? 0
                      : editor.selection?.anchor.path[0]! - 1;
                  Transforms.moveNodes(editor, {
                    at: getFocusedProps(editor).anchor,
                    to: [toPosition],
                  });
                }}
                contentEditable={false}
              >
                <ArrowUpIcon className="w-5 h-5" />
              </div>
            </div>
          </Popover.Panel>
        </Popover>
      </Popover.Group>

      <ComponentRenderElement className={"flex-grow-0 w-full"} />
    </span>
  );
};

export default BlockRenderer;
