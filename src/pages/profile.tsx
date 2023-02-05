import type { NextPage } from "next";

import { trpc } from "../utils/trpc";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

import { useState } from "react";
import { useSession } from "next-auth/react";

import DashboardLayout from "../components/layouts/dashboard";
import MyArticleCard from "../components/editor/MyArticleCard";

import { PlusIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import Loading from "../components/Loading";

const Articles: NextPage = () => {
  const { data, status } = useSession({ required: true });
  const user = data?.user;

  const [isOpen, setIsOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogDescription, setDialogDescription] = useState("");

  const articleData = trpc.useQuery([
    "article.getUserArticleInfos",
    { userId: user?.id },
  ]);
  const createQuery = trpc.useQuery(
    [
      "article.createArticle",
      { title: dialogTitle, description: dialogDescription, bodyData: [] },
    ],
    {
      enabled: false,
    }
  );

  const onSubmitDialog = () => {
    createQuery
      .refetch()
      .then(() => {
        // refresh "My articles" data
        articleData.refetch();

        setDialogDescription("");
        setDialogTitle("");
        setIsOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  if (status === "loading") return <p>Loading...</p>;
  if (status === "loading") return <p>Loading...</p>;
  return (
    <DashboardLayout>
      <Head>
        <title>Profile - Pulth App</title>
        <meta name="description" content="Your Profile in Pulth" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="p-4">
        {status === "loading" ? (
          <Loading className="w-12 h-12 border-2" />
        ) : (
          <>
            <h2>
              <span className="text-2xl font-bold">My Articles</span>
            </h2>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {articleData.data?.map((article) => (
                <MyArticleCard
                  key={article.slug}
                  title={article.title}
                  description={article.description}
                  slug={article.slug}
                  isPublished={article.isPublished}
                  // image={article.image}
                />
              ))}

              {/* Add Project div */}
              <button
                className="py-6 col-span-1 group bg-white border-dashed border-2 rounded-md hover:border-solid hover:border-indigo-500 flex flex-col justify-center items-center"
                onClick={() => setIsOpen(true)}
              >
                <PlusIcon className="w-6 h-6 group-hover:text-indigo-500"></PlusIcon>
                <p className="group-hover:text-indigo-500 text-sm leading-6 font-medium">
                  Create New Article
                </p>
              </button>

              {/* Add Stepper dialog for Tag and topic selection */}
              <Dialog
                open={isOpen}
                onClose={() => {
                  setDialogDescription("");
                  setDialogTitle("");
                  setIsOpen(false);
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
                      className="w-full border border-gray-200 rounded-lg p-2 "
                      value={dialogTitle}
                      onChange={(e) => setDialogTitle(e.target.value)}
                    />

                    <label htmlFor="articleDescription" className="mt-4 block">
                      Description
                    </label>
                    <textarea
                      name="articleDescription"
                      className="w-full border border-gray-200 rounded-lg p-2"
                      value={dialogDescription}
                      onChange={(e) => setDialogDescription(e.target.value)}
                    ></textarea>
                    <div className="flex flex-row justify-between">
                      <button
                        className="mr-auto"
                        onClick={() => {
                          setDialogDescription("");
                          setDialogTitle("");
                          setIsOpen(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="flex flex-row gap-1 justify-center items-center p-2 bg-indigo-500 hover:bg-indigo-400 rounded-md text-white text-sm font-medium disabled:bg-indigo-300"
                        onClick={() => onSubmitDialog()}
                        disabled={createQuery.isLoading}
                      >
                        {createQuery.isLoading ? (
                          <Loading className="w-6 h-6 border-4" />
                        ) : (
                          ""
                        )}
                        Continue
                      </button>
                    </div>
                  </Dialog.Panel>
                </div>
              </Dialog>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Articles;
