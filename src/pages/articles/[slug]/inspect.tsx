import type {
  GetServerSideProps,
  NextApiRequest,
  NextApiResponse,
  NextPage,
} from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Loading from "~/components/Loading";
import Dashboard from "~/components/layouts/gridDashboard";
import { api } from "~/utils/api";
import { Tab, Dialog } from "@headlessui/react";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";

import superjson from "superjson";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { GetStaticPropsContext } from "next";
import { createInnerTRPCContext, createTRPCContext } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";
import { DehydratedState } from "@tanstack/react-query";
import { getServerSession } from "next-auth";
import { analyzeMetadata } from "~/utils/analyzeArticle";

const Inspect: NextPage = () => {
  dayjs.extend(relativeTime);
  const router = useRouter();
  const { slug } = router.query;
  const { data: userData, status } = useSession({ required: true });

  const articleInfo = api.article.inspect.useQuery((slug as string) || "", {
    retry: false,
  });

  const articleUpdateInfoMutation = api.article.updateInfo.useMutation();
  const articlePublishMutation = api.article.publish.useMutation();
  const articleDeleteMutation = api.article.delete.useMutation();

  const updateInfoIsLoading = articleUpdateInfoMutation.isLoading;
  const publishMutationIsLoading = articlePublishMutation.isLoading;

  const [title, setTitle] = useState(articleInfo.data?.title);
  const [description, setDescription] = useState(articleInfo.data?.description);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteModalInput, setDeleteModalInput] = useState("");
  const [analysisResult, setAnalysisResult] = useState<{
    titleScore: number;
    titleChecks: string[];
    descriptionScore: number;
    descriptionChecks: string[];
    totalScore: number;
  }>({
    titleScore: 0,
    titleChecks: [],
    descriptionScore: 0,
    descriptionChecks: [],
    totalScore: 0,
  });

  useEffect(() => {
    if (articleInfo.isError && articleInfo.error.data?.httpStatus === 404) {
    } else {
      setTitle(articleInfo.data?.title);
      setDescription(articleInfo.data?.description);
    }
  }, [articleInfo.data, articleInfo.isError, router, articleInfo.error]);

  useEffect(() => {
    const result = analyzeMetadata(title || " ", description || " ");
    setAnalysisResult(result);
  }, []);

  // shoulde define with memo
  // const analysisResult = analyzeMetadata(title || " ", description || " ");

  useMemo(() => {
    //analyze metadata
    if (updateInfoIsLoading) {
      const result = analyzeMetadata(title || " ", description || " ");
      setAnalysisResult(result);
    }
  }, [title, description, updateInfoIsLoading]);

  return (
    <Dashboard>
      {articleInfo.isLoading ? (
        <div className="flex h-full w-full justify-center">
          <Loading className="my-auto h-20 w-20 border-4" />
        </div>
      ) : articleInfo.isError ? (
        <div className="my-16 flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Article Not Found</h1>
          <Link href="/articles">
            <button className="flex items-center justify-center rounded-lg bg-gray-500 px-4 py-2 text-white">
              Go Back
            </button>
          </Link>
        </div>
      ) : (
        <div className="px-4 py-8">
          <div className="flex flex-row">
            <div className="flex-grow">
              <p className="text-xs text-black/70">Inspect Article</p>
              <h1 className="mt-1 text-2xl font-bold">
                {articleInfo.data?.title}
              </h1>
            </div>
            <div className="hidden gap-4 md:flex md:gap-2">
              <Link
                //href={"/articles/" + slug + "/edit"}
                href={{
                  pathname: `/articles/[slug]/edit`,
                  query: { slug: slug },
                }}
              >
                <button className=" mt-4  flex items-center justify-center rounded-lg bg-gray-500 px-4 py-2 text-white">
                  Edit
                </button>
              </Link>

              {/* This Should open a model for confirmation */}
              <button
                className="mt-4 flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-white"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </button>
            </div>
          </div>
          <hr className="mt-1 border-black" />
          <div className="flex flex-col gap-x-2 md:flex-row">
            <div className="flex-grow">
              <div className="mt-4 grid grid-cols-3 justify-between gap-4">
                <div className="col-span-2">
                  <span className="text-black/70">Description:</span>

                  <p>{articleInfo.data?.description}</p>

                  <span className="text-black/70">Tags:</span>

                  <p>{articleInfo.data?.keywords.join(", ")}</p>
                </div>
                <div className="flex flex-col gap-2 rounded-2xl bg-gray-100 p-2">
                  <span className={` text-xl font-bold text-black/70`}>
                    Score
                  </span>

                  <div
                    className={`pie flex aspect-square h-24 w-24 self-center rounded-full bg-gray-200 font-bold before:m-2`}
                    // style={"--p:40;--c:darkblue;--b:10px"}
                    style={{
                      ["--p" as any]: analysisResult.titleScore.toString(),
                      ["--c" as any]: "#6b7280",
                      ["--b" as any]: "10px",
                      ["--w" as any]: "96px",
                      ["--m" as any]: "8px",
                    }}
                  >
                    {analysisResult.titleScore.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Tab.Group>
                  <Tab.List className="flex space-x-1 rounded bg-gray-800">
                    <Tab
                      className={({ selected }) =>
                        `${
                          selected
                            ? "border-b-4 border-b-indigo-500 text-white"
                            : " text-white/70"
                        }
                          relative flex w-full items-center justify-center px-4 py-2 focus:outline-none`
                      }
                    >
                      <span>General</span>
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        `${
                          selected
                            ? "border-b-4 border-b-indigo-500 text-white"
                            : " text-white/70"
                        }
                          relative flex w-full items-center justify-center px-4 py-2 focus:outline-none`
                      }
                    >
                      <span>SEO</span>
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        `${
                          selected
                            ? "border-b-4 border-b-indigo-500 text-white"
                            : " text-white/70"
                        }
                          relative flex w-full items-center justify-center px-4 py-2 focus:outline-none`
                      }
                    >
                      <span>Stats</span>
                    </Tab>
                  </Tab.List>
                  <Tab.Panels>
                    <Tab.Panel>
                      <div className="mt-4 flex flex-col">
                        <span className="text-black/70">Title:</span>

                        <input
                          className="border-2 p-3 outline-indigo-500"
                          value={title || ""}
                          onChange={(e) => {
                            setTitle(e.target.value);
                          }}
                        />
                      </div>
                      <div className="mt-4 flex flex-col">
                        <span className="text-black/70">Description:</span>

                        <textarea
                          className="h-auto border-2 p-3 outline-indigo-500"
                          value={description || ""}
                          onChange={(e) => {
                            setDescription(e.target.value);
                          }}
                        />

                        <div
                          className={twMerge(
                            "ml-1 text-xs italic text-gray-500",
                            (description?.length || 0) > 320 && "text-red-500",
                            (description?.length || 0) < 120 && "text-red-500"
                          )}
                        >
                          {description?.length}/320
                        </div>
                      </div>
                      <ul id="errors" className="mt-2">
                        <li
                          className={twMerge(
                            (description?.length || 0) > 120 && "hidden",
                            "text-red-500"
                          )}
                        >
                          Description is too short. It should be at least 120
                          charecters long.
                        </li>
                        <li
                          className={twMerge(
                            (description?.length || 0) < 320 && "hidden",
                            "text-red-500"
                          )}
                        >
                          Description is too long. It should be at most 320
                          charecters long.
                        </li>
                      </ul>

                      <div className="flex justify-end gap-2">
                        <button
                          className="my-2 flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-white disabled:bg-indigo-400"
                          disabled={
                            title === "" ||
                            description === "" ||
                            (title === articleInfo.data?.title &&
                              description === articleInfo.data?.description) ||
                            (description?.length || 0) < 40 ||
                            (description?.length || 0) > 320
                          }
                          onClick={() => {
                            console.log({
                              titleEmpty: title === "",
                              descriptionEmpty: description === "",
                              defaultTitle: title === articleInfo.data?.title,
                              defaultDesc:
                                description === articleInfo.data?.description,

                              result:
                                title === "" ||
                                description === "" ||
                                (title === articleInfo.data?.title &&
                                  description ===
                                    articleInfo.data?.description),
                            });

                            const mutationData: {
                              title?: string;
                              description?: string;
                              slug: string;
                            } = {
                              slug: slug as string,
                            };

                            if (title !== articleInfo.data?.title) {
                              mutationData.title = title;
                            }

                            if (description !== articleInfo.data?.description) {
                              mutationData.description = description;
                            }

                            articleUpdateInfoMutation.mutate(mutationData, {
                              onSuccess: (data) => {
                                router.replace(
                                  "/articles/" + data.slug + "/inspect"
                                );
                                articleInfo.refetch();
                              },
                            });
                          }}
                        >
                          {updateInfoIsLoading ? (
                            <Loading className="h-7 w-7 border-2" />
                          ) : (
                            "Save"
                          )}
                        </button>
                        <button
                          className="my-2 flex items-center justify-center rounded-lg bg-gray-500 px-4 py-2 text-white disabled:bg-gray-400"
                          disabled={
                            title === articleInfo.data?.title &&
                            description === articleInfo.data?.description
                          }
                          onClick={() => {
                            setTitle(articleInfo.data?.title);
                            setDescription(articleInfo.data?.description);
                          }}
                        >
                          Clear
                        </button>
                      </div>
                    </Tab.Panel>
                    <Tab.Panel>
                      {/* Panel for SEO Analysis/Score */}
                      <div className="flex justify-between">
                        <div>
                          <p>Title Score {analysisResult.titleScore}</p>
                          {analysisResult.titleChecks.length > 0 && (
                            <ul>
                              {analysisResult.titleChecks.map(
                                (check, index) => (
                                  <li key={index} className="text-red-500">
                                    {check}
                                  </li>
                                )
                              )}
                            </ul>
                          )}
                        </div>
                      </div>
                      <div>
                        <p>
                          Description Score {analysisResult.descriptionScore}
                        </p>
                        {analysisResult.descriptionChecks.length > 0 && (
                          <ul>
                            {analysisResult.descriptionChecks.map(
                              (check, index) => (
                                <li key={index} className="text-red-500">
                                  {check}
                                </li>
                              )
                            )}
                          </ul>
                        )}
                      </div>
                      <div>
                        <p>Total Score</p>
                        <p>{analysisResult.totalScore}</p>
                      </div>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </div>
            </div>

            <div className="order-first mt-4 grid w-full grid-cols-2 gap-x-2 gap-y-1 self-start rounded-2xl bg-gray-100 px-4 pb-4 pt-6  md:order-last md:w-auto md:min-w-fit md:flex-shrink md:flex-grow-0">
              <span className="text-black/70">status:</span>

              <p>
                {articleInfo.data?.isPublished
                  ? "published"
                  : "unpublished/draft"}
              </p>

              {/* <span className="text-black/70">visibility:</span>
              Private, Public, Unlisted

              for subscribers only, for everyone, for subscribers and people with link */}

              <span className="text-black/70">published at:</span>

              <p>{dayjs(articleInfo.data?.updatedAt).fromNow()}</p>

              <span className="text-black/70">created at:</span>

              <p>{dayjs(articleInfo.data?.createdAt).fromNow()}</p>

              {articleInfo.data?.isPublished ? (
                <Link
                  //href={"/articles/" + slug}
                  href={{
                    pathname: "/articles/[slug]",
                    query: { slug: slug },
                  }}
                  className="col-span-2 mb-2 mt-8 flex items-center justify-center rounded-lg bg-gray-500 px-4 py-2 text-white disabled:bg-gray-400 md:mb-0"
                >
                  View
                </Link>
              ) : (
                <button
                  className="col-span-2 mb-2 mt-8 flex items-center justify-center rounded-lg bg-gray-500 px-4 py-2 text-white disabled:bg-gray-400 md:mb-0"
                  disabled={!articleInfo.data?.isPublished}
                >
                  View
                </button>
              )}

              <Link
                href={{
                  pathname: "/articles/[slug]/edit",
                  query: { slug: slug },
                }}
                className=" flex items-center justify-center rounded-lg bg-gray-500 px-4 py-2 text-white md:mb-2 md:mt-6 md:hidden"
              >
                Edit
              </Link>
              {/* <button
              onClick={() => {
                if (typeof articleInfo.data?.isPublished !== "undefined")
                  articlePublishMutation.mutate(
                    {
                      slug: slug as string,

                    },
                    {
                      onSuccess: (data) => {
                        articleInfo.refetch();
                      },
                    }
                  );
              }}
              className="flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-white md:mt-6 "
            >
              {publishMutationIsLoading ? (
                <Loading className="mr-2 h-6 w-6 border-2" />
              ) : (
                ""
              )}
              {articleInfo.data?.isPublished ? "Unpublish" : "Publish"}
            </button> */}

              {/* This Should open a model for confirmation */}
              <button
                className="flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-white md:mb-2 md:mt-6 md:hidden"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </button>
            </div>
          </div>
          <Dialog
            open={deleteDialogOpen}
            onClose={() => {
              if (!articleDeleteMutation.isLoading) {
                setDeleteDialogOpen(false);
                setDeleteModalInput("");
              }
            }}
            className={
              "fixed inset-0 z-10 flex items-center justify-center overflow-y-auto"
            }
          >
            <Dialog.Overlay
              className={"fixed inset-0  bg-black/50 backdrop-blur-md"}
            />
            <Dialog.Panel className={"z-10 max-w-xl rounded-xl bg-white p-2"}>
              <Dialog.Title className={"mb-2 text-xl font-semibold"}>
                Deactivate account
              </Dialog.Title>
              <Dialog.Description className={"texl-lg"}>
                All of the comments and data associated with this article will
                be permanently deleted. This action cannot be undone.
                <br />
                <br />
                Are you sure you want to delete
                <span className="font-bold">
                  &quot;{articleInfo.data?.title}&quot;
                </span>
                ?
              </Dialog.Description>

              <input
                className="my-2 w-full p-2"
                onChange={(e) => {
                  setDeleteModalInput(e.target.value);
                }}
              />
              {deleteModalInput !== articleInfo.data?.title && (
                <p className="mb-2 text-xs text-red-500">
                  Please type the title of the article to confirm
                </p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  disabled={deleteModalInput !== articleInfo.data?.title}
                  onClick={() => {
                    articleDeleteMutation.mutate(slug as string, {
                      onSuccess: () => {
                        router.push("/articles");
                        setDeleteDialogOpen(false);
                      },
                    });
                  }}
                  className="mt-4 flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-white disabled:bg-red-400"
                >
                  {articleDeleteMutation.isLoading && (
                    <Loading className="mr-2 h-6 w-6 border-2" />
                  )}
                  Delete
                </button>
                <button
                  onClick={() => {
                    setDeleteDialogOpen(false);

                    setDeleteModalInput("");
                  }}
                  className=" mt-4 flex items-center justify-center rounded-lg bg-gray-500 px-4 py-2 text-white"
                >
                  Cancel
                </button>
              </div>
            </Dialog.Panel>
          </Dialog>
        </div>
      )}
    </Dashboard>
  );
};

export const getServerSideProps: GetServerSideProps<{
  trpcState: DehydratedState;
}> = async ({ req, query, res }) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: await createTRPCContext({
      req: req as NextApiRequest,
      res: res as NextApiResponse,
    }),
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = query.slug as string;

  // prefetch `article.getBySlug`
  await helpers.article.inspect.prefetch((slug as string) || "");

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
};

export default Inspect;
