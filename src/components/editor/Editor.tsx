import type { MutableRefObject } from "react";
import type { API } from "@editorjs/editorjs";

import EditorJS from "@editorjs/editorjs";
import { NextPage } from "next";
import { useState, useEffect, useRef, useId } from "react";
import { getBaseUrl } from "~/pages/_app";

// todo add editorjs DataTypes
const Editor: NextPage<{
  className?: string;
  data?: any;
  readonly: boolean;

  editorRef: MutableRefObject<EditorJS | null>;
  OnInit?: () => void;
  OnChange?: (editorAPI: API) => void;
}> = ({ className, data, readonly, OnInit, editorRef, OnChange }) => {
  const id = useId();

  // const InternalEditorRef = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      editorRef.current = new EditorJS({
        holder: id,
        autofocus: true,
        data: Object.assign({}, data),
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

    //    if (!InternalEditorRef.current) {
    //   InternalEditorRef.current = new EditorJS({
    //     holder: id,
    //     autofocus: false,
    //     data: Object.assign({}, data),
    //     readOnly: readonly,
    //     tools: editorTools,
    //     onReady: () => {
    //       console.log("ready");
    //     },

    //     onChange: OnChange ?? (() => {}),
    //   });
    //   editorRef.current = InternalEditorRef.current;
    //   if (OnInit) OnInit(InternalEditorRef.current);
    // } else {
    //   // console.log("editorRef.current", InternalEditorRef.current);
    // }
  }, [data, readonly, OnInit, id, editorRef, OnChange]);

  return (
    <div className="flex justify-center">
      <div
        id={id}
        className={className ?? "" + "flex-shrink z-0 flex-grow mx-16"}
      ></div>
    </div>
  );
};

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

// import EditorJS from "@editorjs/editorjs";
// import { NextPage } from "next";
// import React, { useState, useEffect, useRef, useId } from "react";
// import { getBaseUrl } from "../../pages/_app";

// // todo add editorjs DataTypes
// const Editor: NextPage<{
//   className?: string;
//   data?: any;
//   readonly: boolean;
//   OnInit?: (instance: EditorJS) => void;
// }> = ({ className, data, readonly, OnInit }) => {
//   const id = useId();

//   const [editor, setEditor] = useState<EditorJS | null>(null);
//   useEffect(() => {
//     setEditor((prevEditor) => {
//       if (!prevEditor) {
//         const newEditor = new EditorJS({
//           holder: id,
//           autofocus: false,
//           data: data,
//           readOnly: readonly,
//           onReady: () => {
//             if (OnInit) OnInit(newEditor);
//           },
//           tools: {
//             header: {
//               class: require("@editorjs/header"),
//               inlineToolbar: ["link"],
//               config: {
//                 placeholder: "Header",
//               },
//             },
//             list: {
//               class: require("@editorjs/list"),
//               inlineToolbar: true,
//               shortcut: "CMD+SHIFT+L",
//             },
//             Image: {
//               class: require("@editorjs/image"),
//               config: {
//                 uploader: {
//                   uploadByFile(file: File) {
//                     console.log("file", file);
//                     let fm = new FormData();
//                     fm.append("imageFile", file);
//                     return fetch(getBaseUrl() + "/api/uploadImage", {
//                       method: "POST",
//                       body: fm,
//                     })
//                       .then((res) => {
//                         return res.json();
//                       })
//                       .then((res) => {
//                         console.log(res);
//                         return {
//                           success: 1,
//                           file: {
//                             url: res.url,
//                           },
//                         };
//                       });
//                   },
//                 },
//               },

//               // todo Add more tools
//               // such as
//               // quote: require("@editorjs/quote"),
//               // warning: require("@editorjs/warning"),
//               // marker: require("@editorjs/marker"),
//               // code: require("@editorjs/code"),
//               // delimiter: require("@editorjs/delimiter"),
//               // inlineCode: require("@editorjs/inline-code"),
//               // linkTool: require("@editorjs/link"),
//               // raw: require("@editorjs/raw"),
//               // checklist: require("@editorjs/checklist"),

//               // Todo add image upload Endpoints etc.
//               // image: {
//               //   class: require("@editorjs/image"),
//               //   config: {
//               //     endpoints: {
//               //       byFile: "http://localhost:8008/uploadFile", // Your backend file uploader endpoint
//               //       byUrl: "http://localhost:8008/fetchUrl", // Your endpoint that provides uploading by Url
//               //     },
//               //   },
//               // },
//             },
//           },
//         });
//         return newEditor;
//       }
//       return null;
//     });
//     return () => {
//       if (editor) editor.destroy();
//     };
//     // solve exaustive deps warning
//   }, [id]);

//   return <div id={id} className={className + " "}></div>;
// };

// export default Editor;

// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: "4mb", // Set desired size of the body
//     },
//   },
// };
