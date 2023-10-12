import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextApiRequest,
  NextApiResponse,
  NextPage,
} from "next";
import EditorJS, { API, OutputBlockData } from "@editorjs/editorjs";

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
import { getServerAuthSession } from "~/server/auth";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { set } from "zod";

const Editor = dynamic(() => import("~/components/editor/Editor"), {
  ssr: false,
});

const Articles: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = (defaultProps) => {
  const { status: authStatus } = useSession({ required: true });

  // router is used for getting the slug
  // and for redirecting the user
  const router = useRouter();
  const { slug } = router.query;

  const [EditorData, setEditorData] = useState<OutputBlockData<string, any>[]>(
    defaultProps.draftBodyData
  );

  const [draftBodyData, setDraftBodyData] = useState<
    OutputBlockData<string, any>[]
  >(defaultProps.draftBodyData);

  const [publishedBodyData, setPublishedBodyData] = useState<
    OutputBlockData<string, any>[]
  >(defaultProps.bodyData);

  const [isPublished, setIsPublished] = useState(defaultProps.isPublished);

  //Delete Modal States
  const [deleteTitleInput, setDeleteTitleInput] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);

  // Share Modal State
  const [shareModal, setShareModal] = useState(false);

  // state for EditorJS instance
  const editor = useRef<EditorJS | null>(null);

  // states for EditorJS data
  const [isDraft, setIsDraft] = useState(false);
  const [isLocal, setIsLocal] = useState(false);

  const publishArticleMutation = api.article.publish.useMutation();
  const unpublishArticleMutation = api.article.unpublish.useMutation();

  const deleteArticleMutation = api.article.delete.useMutation();
  const updateArticleMutation = api.article.updateBody.useMutation();
  const undoChangesArticleMutation = api.article.undoChanges.useMutation();

  const handleDeleteButton = () => {
    if (deleteTitleInput == defaultProps.title) {
      deleteArticleMutation.mutate(slug as string);
      setDeleteModal(false);
      router.push("/profile");
    } else {
      // TODO: Remove alert and add a proper error message
      alert("Wrong Title Name");
    }
  };

  const OnMenuClick = (menuType: string) => {
    switch (menuType) {
      case "delete":
        setDeleteModal(true);
        break;
      case "share":
        setShareModal(true);

        break;
      case "undo-changes":
        undoChangesArticleMutation.mutate(slug as string, {
          onSuccess: (data) => {
            // setDraftBodyData(data.bodyData);
            // setEditorData(data.bodyData);
            router.reload();
          },
        });
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

  const onChange = useCallback((api: API) => {
    console.log("EditorData has been changed");
    api.saver.save().then((outputData) => {
      setEditorData(outputData.blocks);
    });
  }, []);

  useEffect(() => {
    setIsLocal(JSON.stringify(EditorData) !== JSON.stringify(draftBodyData));
    setIsDraft(
      JSON.stringify(draftBodyData) !== JSON.stringify(publishedBodyData)
    );
  }, [EditorData, draftBodyData, publishedBodyData]);

  return (
    <DashboardLayout>
      <Head>
        <title>Edit Mode - Pulth App</title>
      </Head>
      <div>
        <div>
          <EditorTopbar
            title={defaultProps.title}
            //
            // Props for right text appearing in buttons
            isPublished={isPublished!}
            isDraft={isDraft}
            isLocal={isLocal}
            //
            // On Save
            onSave={() => {
              editor.current?.save().then((outputData) => {
                console.log("Saved Article Data", outputData);
                // for checking if the data has changed
                setDraftBodyData(outputData.blocks);

                updateArticleMutation.mutate({
                  slug: slug as string,
                  bodyData: outputData.blocks,
                });
              });
            }}
            onPublish={async () => {
              const currentData = await editor.current?.save();

              // TODO: Add ui feedback to user
              // if the data is null then return
              if (!currentData) return;
              // if the data is empty then return
              if (currentData.blocks.length == 0) return;

              setPublishedBodyData(currentData.blocks);
              setDraftBodyData(currentData.blocks);
              setIsPublished(true);

              // if there is a data then toggle article publish state
              publishArticleMutation.mutate({
                slug: slug as string,
                editorData: currentData.blocks,
              });
            }}
            onUnpublish={() => {
              setIsPublished(false);
              unpublishArticleMutation.mutate(slug as string);
            }}
            onMenuClick={OnMenuClick}
            saveLoading={updateArticleMutation.isLoading}
            publishLoading={publishArticleMutation.isLoading}
          />
          <Editor
            readonly={false}
            data={{
              //time: articleAuthorFetch.data.updatedAt,
              blocks: draftBodyData || [
                {
                  type: "paragraph",
                  data: {
                    text: "Loading...",
                  },
                },
              ],
              //version: articleAuthorFetch.data.editorVersion,
            }}
            editorRef={editor}
            // OnInit={handleInit}
            OnChange={onChange}
          />
        </div>
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
                      {defaultProps.title}
                    </label>
                    <input
                      placeholder="Article Name"
                      className="rounded-lg border-2 p-2 focus:border-red-500 focus:outline-none focus:ring-0"
                      onChange={(e) =>
                        setDeleteTitleInput(e.target.value.toString())
                      }
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
                      <div
                        className="group flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 border-blue-500 bg-transparent transition-colors duration-150 hover:bg-blue-500"
                        onClick={() => {
                          //   const shareURL = `${window.location.origin}/articles/${articleAuthorFetch.data?.slug}`
                          //   const shareObject = {
                          //     title: articleAuthorFetch.data?.title,
                          //     text: articleAuthorFetch.data?.description,
                          //     url: shareURL,
                          //   };

                          //   if(navigator.canShare(shareObject))
                          //   {
                          //     navigator.share(shareObject);
                          //   }else{
                          //     alert("Your browser does not support sharing");
                          //   }
                          window.open(
                            `https://twitter.com/intent/tweet?text=${
                              defaultProps.title
                            }&url=${window.location.origin}/articles/${
                              slug as string
                            }`,
                            "_blank"
                          );
                        }}
                      >
                        <TwitterIcon className="mt-0.5 fill-blue-500 stroke-none transition-colors duration-150 group-hover:fill-white group-hover:stroke-none" />
                      </div>
                      {/* <div className="group flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 border-blue-900 bg-transparent transition-colors duration-150 hover:bg-blue-900">
                        <FacebookIcon className="mt-0.5 fill-blue-900 stroke-none transition-colors duration-150 group-hover:fill-white group-hover:stroke-none" />
                      </div> */}
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
                        className="rounded-md bg-indigo-500 px-2 py-1 text-white"
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

// getServerSideProps
export const getServerSideProps: GetServerSideProps<{
  bodyData: OutputBlockData<string, any>[];
  draftBodyData: OutputBlockData<string, any>[];
  title: string;
  isPublished: boolean;
}> = async ({ req, res, query }) => {
  const session = await getServerAuthSession({
    req,
    res,
  });

  if (!session)
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };

  const caller = appRouter.createCaller(
    await createTRPCContext({
      req: req as NextApiRequest,
      res: res as NextApiResponse,
    })
  );

  const articleData = await caller.article
    .editData(query.slug as string)
    .catch((err) => {
      console.log(err);
      return {
        error: true,
      };
    });

  if ("error" in articleData) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      session: await getServerAuthSession({
        req,
        res,
      }),
      bodyData: articleData.bodyData,
      draftBodyData: articleData.draftBodyData,
      title: articleData.title,
      isPublished: articleData.isPublished,
    },
  };
};
