import type { NextPage } from "next";
import EditorJS from "@editorjs/editorjs";

import { trpc } from "../../../utils/trpc";
import Head from "next/head";

import ArticleError from "../../../components/responses/ArticleError";
import Loading from "../../../components/Loading";
import EditorTopbar from "../../../components/editor/EditorTopbar";
import DashboardLayout from "../../../components/layouts/dashboard";

// load editor only on client side
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";

import dynamic from "next/dynamic";
import { Transition, Dialog } from "@headlessui/react";
import TwitterIcon from "../../../components/icons/TwitterIcon";
import FacebookIcon from "../../../components/icons/FacebookIcon";

const Editor = dynamic(() => import("../../../components/editor/Editor"), {
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

  // const handleInit = useCallback((instance: EditorJS) => {
  //   setEditor(instance);
  // }, []);

  const articleAuthorFetch = trpc.useQuery(
    ["article.getArticleBySlugAuthor", { slug: slug as string }],
    {
      enabled: status === "authenticated",
      //   refetchOnWindowFocus: false,
      //   refetchOnMount: false,
      //   refetchOnReconnect: false,
      //   refetchInterval: false,
      //   refetchIntervalInBackground: false,
      onSuccess: (data) => {
        if (data) {
          setBodyData(data.bodyData);
        }
      },
    }
  );

  const publishArticleMutation = trpc.useMutation("article.publishArticle");
  const deleteArticleMutation = trpc.useMutation("article.deleteArticleBySlug");
  const updateArticleMutation = trpc.useMutation("article.updateArticleBody");

  const handleDeleteButton = () => {
    if (titleInput == articleAuthorFetch.data?.title) {
      deleteArticleMutation.mutate({ slug: slug as string });
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
          className="z-20 relative"
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
            <div className="flex justify-center items-center h-full">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Panel className="bg-white rounded-md p-4 flex flex-col gap-y-4">
                  <Dialog.Title className="text-xl font-semibold">
                    Delete Article
                  </Dialog.Title>
                  <div className="flex flex-col">
                    <label className="mb-2">
                      To delete your article write the name of you article below
                    </label>
                    <label className="italic text-black/50 text-sm ">
                      {articleAuthorFetch.data?.title}
                    </label>
                    <input
                      placeholder="Article Name"
                      className="p-2 rounded-lg border-2 focus:border-red-500 focus:ring-0 focus:outline-none"
                      onChange={(e) => setTitleInput(e.target.value.toString())}
                    ></input>
                  </div>
                  <button
                    className="bg-red-500 rounded p-2 text-white w-1/3"
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
          className="z-20 relative"
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
            <div className="flex justify-center items-center h-full">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Panel className="bg-white rounded-md p-4 flex flex-col gap-y-4">
                  <Dialog.Title className="text-xl font-semibold">
                    Share Article
                  </Dialog.Title>
                  <hr />
                  <div className="flex flex-col gap-y-2">
                    <p>Share this article via</p>
                    <div className="flex gap-x-4">
                      <div className="group cursor-pointer rounded-full h-12 w-12 bg-transparent border-2 transition-colors duration-150 flex justify-center items-center border-blue-500 hover:bg-blue-500">
                        <TwitterIcon className="stroke-none fill-blue-500 group-hover:stroke-none group-hover:fill-white transition-colors duration-150 mt-0.5" />
                      </div>
                      <div className="group cursor-pointer rounded-full h-12 w-12 bg-transparent border-2 transition-colors duration-150 flex justify-center items-center border-blue-900 hover:bg-blue-900">
                        <FacebookIcon className="stroke-none fill-blue-900 group-hover:stroke-none group-hover:fill-white transition-colors duration-150 mt-0.5" />
                      </div>
                    </div>
                    <p>You can use link</p>
                    <div className="bg-black/10 p-2 rounded-md flex gap-x-3">
                      <input
                        className="bg-transparent"
                        disabled
                        value={shareURL}
                      />
                      <button
                        onClick={copyURL}
                        className="bg-indigo-500 text-white py-1 px-2 rounded-md"
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
