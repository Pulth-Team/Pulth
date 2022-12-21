import EditorJS from "@editorjs/editorjs";
import { NextPage } from "next";
import React, { useState, useEffect, useRef, useId } from "react";

// todo add editorjs DataTypes
const Editor: NextPage<{
  className?: string;
  data?: any;
  readonly: boolean;
}> = ({ className, data, readonly }) => {
  const id = useId();
  const [editor, setEditor] = useState<EditorJS | null>(null);

  useEffect(() => {
    // set editor only if it's not set
    setEditor((prevEditor) => {
      // if editor is not set, create new editor
      if (!prevEditor) {
        return new EditorJS({
          holder: id,
          autofocus: false,
          data: data,
          readOnly: readonly,

          tools: {
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
            // todo Add more tools
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

            // Todo add image upload Endpoints etc.
            // image: {
            //   class: require("@editorjs/image"),
            //   config: {
            //     endpoints: {
            //       byFile: "http://localhost:8008/uploadFile", // Your backend file uploader endpoint
            //       byUrl: "http://localhost:8008/fetchUrl", // Your endpoint that provides uploading by Url
            //     },
            //   },
            // },
          },
        });
      }
      // if editor is set, return null
      return null;
    });

    // destroy editor on unmount
    return () => {
      // destroy editor if it's set
      if (editor) {
        editor.destroy();
      }
    };

    // run effect only if id changes
  }, [editor, id]);

  return <div id={id} className={className + ""}></div>;
};

export default Editor;
