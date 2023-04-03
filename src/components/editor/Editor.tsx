import { MutableRefObject, memo, useLayoutEffect } from "react";
import type { API } from "@editorjs/editorjs";

import EditorJS from "@editorjs/editorjs";
import { NextPage } from "next";
import { useState, useEffect, useRef, useId } from "react";
import { getBaseUrl } from "~/utils/api";

// todo add editorjs DataTypes
const Editor: NextPage<{
  className?: string;
  data?: any;
  readonly: boolean;

  editorRef: MutableRefObject<EditorJS | null>;
  OnInit?: () => void;

  OnChange?: (editorAPI: API) => void;
}> = memo(function EditorComp({
  className,
  data,
  readonly,
  OnInit,
  editorRef,
  OnChange,
}) {
  const id = useId();

  useLayoutEffect(() => {
    if (!editorRef.current) {
      console.log("editorRef.current Init", editorRef.current);
      editorRef.current = new EditorJS({
        holder: id,
        autofocus: true,
        data: JSON.parse(data),
        readOnly: readonly,
        tools: editorTools,
        onReady: OnInit ?? (() => {}),
        onChange: OnChange ?? (() => {}),
      });
    } else {
      console.log("editorRef.current", editorRef.current);
    }

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [readonly, OnInit, id, editorRef, OnChange, data]);

  //data, readonly, OnInit, id, editorRef, OnChange
  //data causes to reinit the editor
  //it happens because of the referantial equality of the data object

  //the solution is give the data with a referantial equality
  //so we can use the useEffect hook to update the data
  // example prop will look like this
  // data={JSON.stringify(data)}

  return (
    <div className="flex justify-center">
      <div
        id={id}
        className={className ?? "" + "z-0 mx-16 flex-shrink flex-grow"}
      ></div>
    </div>
  );
});

export default Editor;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb", // Set desired size of the body
    },
  },
};

const editorTools = {
  //           tools: {
  header: {
    class: require("@editorjs/header"),
    inlineToolbar: ["link"],
    config: {
      placeholder: "Header",
    },
  },
  list: {
    class: require("@editorjs/list"),
    inlineToolbar: true,
    shortcut: "CMD+SHIFT+L",
  },
  Image: {
    class: require("@editorjs/image"),
    config: {
      uploader: {
        uploadByFile(file: File) {
          console.log("file", file);
          let fm = new FormData();
          fm.append("imageFile", file);
          return fetch(getBaseUrl() + "/api/uploadImage", {
            method: "POST",
            body: fm,
          })
            .then((res) => {
              return res.json();
            })
            .then((res) => {
              console.log(res);
              return {
                success: 1,
                file: {
                  url: res.url,
                },
              };
            });
        },
      },
    },
    // TODO: Add more tools
    // such as
    // quote: require("@editorjs/quote"),
    // warning: require("@editorjs/warning"),
    // marker: require("@editorjs/marker"),
    // code: require("@editorjs/code"),
    // delimiter: require("@editorjs/delimiter"),
    // inlineCode: require("@editorjs/inline-code"),
    // linkTool: require("@editorjs/link"),
    // raw: require("@editorjs/raw"),
    // checklist: require("@editorjs/checklist"),
  },
};
