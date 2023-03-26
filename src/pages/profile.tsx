import type { NextPage } from "next";

import { api } from "~/utils/api";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

import { useState } from "react";
import { useSession } from "next-auth/react";

import DashboardLayout from "~/components/layouts/gridDashboard";
import MyArticleCard from "~/components/editor/MyArticleCard";
const Tour = dynamic(() => import("~/components/Tour"), { ssr: false });

import { PlusIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import Loading from "~/components/Loading";

const Articles: NextPage = () => {
  const { data, status } = useSession({ required: true });
  const user = data?.user;

  const [isOpen, setIsOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogDescription, setDialogDescription] = useState("");

  const articleData = api.article.getByAuthor.useQuery({
    userId: user?.id || "",
  });

  const createMutation = api.article.create.useMutation();

  const onSubmitDialog = () => {
    createMutation.mutate({
      title: dialogTitle,
      description: dialogDescription,
    });

    // refresh "My articles" data
    articleData.refetch();

    // reset dialog
    setDialogDescription("");
    setDialogTitle("");

    // close dialog
    setIsOpen(false);
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Profile - Pulth App</title>
        <meta name="description" content="Your Profile in Pulth" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="p-4">
        {status === "loading" ? (
          <Loading className="h-12 w-12 border-2" />
        ) : (
          <>
            <h2>
              <span className="text-2xl font-bold">My Articles</span>
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
                className="group col-span-1 flex flex-col items-center justify-center rounded-md border-2 border-dashed bg-white py-6 hover:border-solid hover:border-indigo-500"
                onClick={() => setIsOpen(true)}
                id="create-article-button"
              >
                <PlusIcon className="h-6 w-6 group-hover:text-indigo-500"></PlusIcon>
                <p className="text-sm font-medium leading-6 group-hover:text-indigo-500">
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
                  <Dialog.Panel className="w-11/12 rounded-2xl bg-white p-4 lg:w-2/5">
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
                      className="w-full rounded-lg border border-gray-200 p-2 "
                      value={dialogTitle}
                      onChange={(e) => setDialogTitle(e.target.value)}
                    />

                    <label htmlFor="articleDescription" className="mt-4 block">
                      Description
                    </label>
                    <textarea
                      name="articleDescription"
                      className="w-full rounded-lg border border-gray-200 p-2"
                      value={dialogDescription}
                      onChange={(e) => setDialogDescription(e.target.value)}
                    ></textarea>
                    <div className="mt-4 flex flex-row justify-between">
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
                        className="flex flex-row items-center justify-center gap-1 rounded-md bg-indigo-500 p-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:bg-indigo-300"
                        onClick={() => onSubmitDialog()}
                        disabled={createQuery.isLoading}
                      >
                        {createQuery.isLoading ? (
                          <Loading className="h-6 w-6 border-4" />
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
      <Tour
        className="w-96"
        start={"redirect"}
        onFinished={(e, message) => {
          if (e === "error") console.error(message);
        }}
        tours={[
          {
            targetQuery: "#create-article-button",
            message:
              "Click here to create a new article. You can also create a new article by clicking the 'New Article' button in the top right corner.",
            direction: "bottom",
            align: "start",
            className: "my-5",
          },
        ]}
      />
    </DashboardLayout>
  );
};

export default Articles;
