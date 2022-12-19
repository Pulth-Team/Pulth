import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

import type { NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { useState } from "react";

import { Dialog } from "@headlessui/react";

const Editor = dynamic(() => import("../../components/Editor"), {
  ssr: false,
});

import DashboardLayout from "../../components/layouts/dashboard";

const CreateArticle: NextPage = () => {
  const [ArticleName, setArticleName] = useState("Untitled Article");

  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [dialogTitle, setDialogTitle] = useState("");

  const router = useRouter();

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
          <Editor className={isDialogOpen ? "hidden" : "block"} />
        </div>

        <Dialog
          open={isDialogOpen}
          onClose={() => {
            return;
          }}
        >
          <div
            className="fixed inset-0 bg-black/30  backdrop-blur-md"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          />
          <div className="fixed inset-0 flex items-center justify-center  ">
            <Dialog.Panel className="bg-white p-4 rounded-2xl w-2/5">
              <Dialog.Title className="text-xl font-bold">
                Create new article
              </Dialog.Title>
              <Dialog.Description className={"text-sm font-light"}>
                Enter a name and a description for your new article.
              </Dialog.Description>
              <label htmlFor="articleName" className="mt-4 block">
                Title
              </label>
              <input
                name="articleName"
                type="text"
                value={dialogTitle}
                onChange={(e) => setDialogTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2 "
              />

              <label htmlFor="articleDescription" className="mt-4 block">
                Description
              </label>
              <textarea
                name="articleDescription"
                className="w-full border border-gray-200 rounded-lg p-2 "
              ></textarea>

              <button className="mr-4" onClick={() => setIsDialogOpen(false)}>
                Continue
              </button>
              <button
                onClick={() => {
                  router.back();
                  setIsDialogOpen(false);
                }}
              >
                Cancel
              </button>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CreateArticle;
