import type { NextPage } from "next";
import EditorJS from "@editorjs/editorjs";

import { api } from "~/utils/api";
import Head from "next/head";

import ArticleError from "~/components/responses/ArticleError";
import Loading from "~/components/Loading";
import EditorTopbar from "~/components/editor/EditorTopbar";

import DashboardLayout from "~/components/layouts/gridDashboard";

// load editor only on client side
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";

import dynamic from "next/dynamic";
import { Transition, Dialog } from "@headlessui/react";
import TwitterIcon from "~/components/icons/TwitterIcon";
import FacebookIcon from "~/components/icons/FacebookIcon";

const Editor = dynamic(() => import("~/components/editor/Editor"), {
  ssr: false,
});

const Articles: NextPage = ({}) => {
  const { status } = useSession({ required: true });
  const [isFetching, setIsFetching] = useState(true);
  const [bodyData, setBodyData] = useState<any>(null);
  const [titleInput, setTitleInput] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const router = useRouter();
  const { slug } = router.query;

  // const [editor, setEditor] = useState<EditorJS | null>(null);
  const editor = useRef<EditorJS | null>(null);

  const articleAuthorFetch = api.article.inspect.useQuery(slug as string, {
    enabled: status === "authenticated",
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    onSuccess: (data) => {
      if (data) {
        setBodyData(data.bodyData);
      }
    },
  });

  const publishArticleMutation = api.article.publish.useMutation();
  const deleteArticleMutation = api.article.delete.useMutation();
  const updateArticleMutation = api.article.updateBody.useMutation();

  const handleDeleteButton = () => {
    if (titleInput == articleAuthorFetch.data?.title) {
      deleteArticleMutation.mutate(slug as string);
      setDeleteModal(false);
      router.push("/profile");
    } else {
      // TODO: add error message more than just an alert

      alert("Wrong Title Name");
    }
  };

  useEffect(() => {
    if (articleAuthorFetch.isSuccess && status === "authenticated")
      setIsFetching(false);
  }, [status, articleAuthorFetch.isSuccess]);

  // // TODO: find a better way to update the body data (without using useEffect)
  // // FIXME: is this really working? (it seems to be working) (not sure)
  // useEffect(() => {
  //   if (bodyData) {
  //     updateArticleMutation.mutate({
  //       slug: slug as string,
  //       bodyData,
  //     });
  //   }
  // }, [bodyData]);

  const OnSave = () => {
    editor.current?.save().then((outputData) => {
      console.log("Saved Article Data", outputData);
      updateArticleMutation.mutate({
        slug: slug as string,
        bodyData: outputData.blocks as any, // TODO: fix this type
      });
    });
    // editor?.save().then((outputData) => {
    //   console.log("Saved Article Data", outputData);
    //   setBodyData(outputData.blocks);
    //   // articleUpdateBodyFetch.refetch();
    //   updateArticleMutation.mutate({
    //     slug: slug as string,
    //     bodyData: outputData.blocks as any, // TODO: fix this type
    //   });
    // });
  };

  const OnMenuClick = (menuType: string) => {
    switch (menuType) {
      case "delete":
        setDeleteModal(true);
        break;
      case "share":
        setShareModal(true);
        break;
      default:
        console.log("Menu Item onClick not defined");
        break;
    }
  };

  const shareURL = `https://pulth.com/articles/${slug}`;

  const copyURL = async () => {
    await navigator.clipboard.writeText(shareURL);
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Edit Mode - Pulth App</title>
      </Head>
      <div>
        {!isFetching ? (
          articleAuthorFetch.data ? (
            <div>
              <EditorTopbar
                title={articleAuthorFetch.data.title}
                onSave={OnSave}
                onPublish={async () => {
                  const currentData = await editor.current?.save();

                  // TODO: add a better way to check if the data has changed
                  // check if the data has changed
                  // if changed save the data
                  if (
                    JSON.stringify(currentData?.blocks) !==
                    JSON.stringify(bodyData)
                  ) {
                    // we can update the body data and the publish the article
                    // the order of the mutation is not important
                    // because the article will be published regardless of the data
                    // and the data will be updated regardless of the publish status
                    articleAuthorFetch.refetch();
                  }
                  publishArticleMutation.mutate({ slug: slug as string });
                }}
                onMenuClick={(type) => {
                  OnMenuClick(type);
                }}
                saveLoading={updateArticleMutation.isLoading}
                publishLoading={publishArticleMutation.isLoading}
              />
              <Editor
                readonly={false}
                data={{
                  time: articleAuthorFetch.data.updatedAt,
                  blocks: articleAuthorFetch.data.bodyData,
                  version: articleAuthorFetch.data.editorVersion,
                }}
                editorRef={editor}
                // OnInit={handleInit}
                OnChange={(api) => {}}
              />
            </div>
          ) : (
            <ArticleError
              title="You are not the author of this file"
              desc="Please make sure you are on the correct page"
            />
          )
        ) : (
          <Loading className="w-12 border-2" />
        )}
      </div>
      <Transition appear show={deleteModal} as={Fragment}>
        <Dialog
          open={deleteModal}
          onClose={() => setDeleteModal(false)}
          className="relative z-20"
          as="div"
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50"></div>
          </Transition.Child>
          <div className="fixed inset-0">
            <div className="flex h-full items-center justify-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Panel className="flex flex-col gap-y-4 rounded-md bg-white p-4">
                  <Dialog.Title className="text-xl font-semibold">
                    Delete Article
                  </Dialog.Title>
                  <div className="flex flex-col">
                    <label className="mb-2">
                      To delete your article write the name of you article below
                    </label>
                    <label className="text-sm italic text-black/50 ">
                      {articleAuthorFetch.data?.title}
                    </label>
                    <input
                      placeholder="Article Name"
                      className="rounded-lg border-2 p-2 focus:border-red-500 focus:outline-none focus:ring-0"
                      onChange={(e) => setTitleInput(e.target.value.toString())}
                    ></input>
                  </div>
                  <button
                    className="w-1/3 rounded bg-red-500 p-2 text-white"
                    onClick={() => handleDeleteButton()}
                  >
                    Delete Article
                  </button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <Transition appear show={shareModal} as={Fragment}>
        <Dialog
          open={shareModal}
          onClose={() => setShareModal(false)}
          className="relative z-20"
          as="div"
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50"></div>
          </Transition.Child>
          <div className="fixed inset-0">
            <div className="flex h-full items-center justify-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Panel className="flex flex-col gap-y-4 rounded-md bg-white p-4">
                  <Dialog.Title className="text-xl font-semibold">
                    Share Article
                  </Dialog.Title>
                  <hr />
                  <div className="flex flex-col gap-y-2">
                    <p>Share this article via</p>
                    <div className="flex gap-x-4">
                      <div className="group flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 border-blue-500 bg-transparent transition-colors duration-150 hover:bg-blue-500">
                        <TwitterIcon className="mt-0.5 fill-blue-500 stroke-none transition-colors duration-150 group-hover:fill-white group-hover:stroke-none" />
                      </div>
                      <div className="group flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 border-blue-900 bg-transparent transition-colors duration-150 hover:bg-blue-900">
                        <FacebookIcon className="mt-0.5 fill-blue-900 stroke-none transition-colors duration-150 group-hover:fill-white group-hover:stroke-none" />
                      </div>
                    </div>
                    <p>You can use link</p>
                    <div className="flex gap-x-3 rounded-md bg-black/10 p-2">
                      <input
                        className="bg-transparent"
                        disabled
                        value={shareURL}
                      />
                      <button
                        onClick={copyURL}
                        className="rounded-md bg-indigo-500 py-1 px-2 text-white"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </DashboardLayout>
  );
};

export default Articles;
