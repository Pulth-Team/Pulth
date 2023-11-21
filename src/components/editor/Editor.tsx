import {
  useRef,
  useEffect,
  useLayoutEffect,
  MutableRefObject,
  useMemo,
} from "react";
import type { API, EditorConfig } from "@editorjs/editorjs";
import type EditorJS from "@editorjs/editorjs";
import { getBaseUrl } from "~/utils/api";

interface EditorProps {
  data: EditorConfig["data"];
  className?: string;
  readonly: boolean;

  editorRef: MutableRefObject<EditorJS | null>;
  OnInit?: () => void;

  OnChange?: (editorAPI: API) => void;
}
export default function Editor({
  data,
  editorRef,
  OnChange,
  OnInit,
  readonly,
}: EditorProps): JSX.Element {
  const elmtRef = useRef<HTMLDivElement>(null);

  useMemo(() => {
    const createEditor = async () => {
      const { default: EditorJS } = await import("@editorjs/editorjs");

      if (
        typeof elmtRef.current === "undefined" ||
        elmtRef.current === null ||
        editorRef.current !== null ||
        data === null
      ) {
        return;
      }

      editorRef.current = new EditorJS({
        tools: editorTools,
        data: data,
        readOnly: readonly,
        holder: elmtRef.current,
        onChange: OnChange ?? (() => {}),
        onReady: OnInit ?? (() => {}),
      });
      await editorRef.current.isReady.then(() => {
        console.log("Editor.js is ready to work!");
      });
    };

    createEditor().catch((error): void => console.error(error));

    return async () => {
      //editorRef.current?.destroy();
      // editorJs?.destroy();
      if (editorRef.current !== null) {
        await editorRef.current.isReady.then(() => {
          if (editorRef.current !== null) editorRef.current.destroy();
        });
        editorRef.current = null;
      }
    };
  }, [data, elmtRef, editorRef, OnChange, OnInit, readonly]);

  return <div ref={elmtRef} id="editor" />;
}

const editorTools = {
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
  // Image Tool Deprecated and will be removed in the future
  // DEPRECATED:
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
              console.log(res);
              return res.json().catch(() => {
                return res.text();
              });
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
