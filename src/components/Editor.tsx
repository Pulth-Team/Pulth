import EditorJS from "@editorjs/editorjs";
import React, { useState, useEffect, useRef, useId } from "react";

const Editor = () => {
  const id = useId();
  const [editor, setEditor] = useState<EditorJS | null>(null);

  useEffect(() => {
    console.log("hii");
    setEditor((prevEditor) => {
      if (!prevEditor) {
        return new EditorJS({
          holder: id,
        });
      }
      return null;
    });
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor, id]);

  return <div id={id} className="border border-gray-400"></div>;
};

export default Editor;
