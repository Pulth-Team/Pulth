import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { useState } from "react";

import { createEditor } from "slate";
import { Slate, Editable, withReact } from "slate-react";

// TypeScript users only add this code
import { BaseEditor, Descendant } from "slate";
import { ReactEditor } from "slate-react";

import BlockRenderer from "../components/editor/blockRenderer";
import { getDocument } from "../utils/editorHelpers";

const initialValue = [
  {
    type: "paragraph",
    children: [
      {
        text: "A line of text in a paragraph.",
      },
    ],
  },
] as Descendant[];

const EditorPage: NextPage = () => {
  const [editor] = useState<BaseEditor & ReactEditor>(() =>
    withReact(createEditor())
  );

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className="bg-slate-200 h-12  w-full px-12 flex justify-between items-center">
        <Link href="/">Pulth</Link>
        <div className="flex gap-4">
          <Link href="#">
            <div className="p-1.5 rounded-md  border border-slate-400">
              Login
            </div>
          </Link>
          <Link href="#">
            <div className="p-1.5 rounded-md  border border-slate-400">
              Register
            </div>
          </Link>
        </div>
      </nav>
      <main className="w-full p-5 sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 mx-auto ">
        <Slate editor={editor} value={initialValue}>
          <Editable renderElement={BlockRenderer}></Editable>
        </Slate>
      </main>
      <button
        onClick={() => {
          let value = getDocument(editor);
          console.log(value);
        }}
      >
        Log Document
      </button>
    </>
  );
};

export default EditorPage;