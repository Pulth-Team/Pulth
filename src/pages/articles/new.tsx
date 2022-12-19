import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";

import { useState } from "react";

const Editor = dynamic(() => import("../../components/Editor"), {
  ssr: false,
});

import DashboardLayout from "../../components/layouts/dashboard";

const CreateArticle: NextPage = () => {
  const [ArticleName, setArticleName] = useState("Untitled Article");

  return (
    <DashboardLayout>
      <Head>
        <title>Create Article - Pulth App</title>
        <meta name="description" content="Create Article in Pulth" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="p-4">
        <div className="mb-2 flex flex-row items-center gap-2">
          <h2 className="mr-auto">
            <span className="text-3xl font-bold">{ArticleName}</span>
          </h2>

          <button className="p-2 px-4 border-2 border-dashed border-indigo-400 rounded-lg hover:bg-indigo-500 hover:text-white hover:border-solid  ">
            Publish
          </button>
          <button className="border border-gray-200 self-stretch rounded-lg hover:bg-gray-100 active:bg-gray-200">
            <EllipsisVerticalIcon className="w-8 h-8"></EllipsisVerticalIcon>
          </button>
        </div>

        <hr />
        <div className="mt-4 ">
          <Editor />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateArticle;
