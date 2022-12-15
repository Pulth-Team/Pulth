import EditorJS from "@editorjs/editorjs";
import { NextPage } from "next";
import React, { useState, useEffect, useRef, useId } from "react";

const Editor: NextPage<{ className?: string }> = ({ className }) => {
  const id = useId();
  const [editor, setEditor] = useState<EditorJS | null>(null);

  useEffect(() => {
    // set editor only if it's not set
    setEditor((prevEditor) => {
      // if editor is not set, create new editor
      if (!prevEditor) {
        return new EditorJS({
          holder: id,
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

  return <div id={id} className={className}></div>;
};

export default Editor;
