import type {
  GetServerSideProps,
  NextApiRequest,
  NextApiResponse,
  NextPage,
} from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Loading from "~/components/Loading";
import Dashboard from "~/components/layouts";
import { api } from "~/utils/api";
import { Tab, Dialog, Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/20/solid";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

import superjson from "superjson";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { createTRPCContext } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";
import { DehydratedState } from "@tanstack/react-query";

import TagTab from "~/components/Tabs/TagTab";

const Inspect: NextPage = () => {
  dayjs.extend(relativeTime);
  const router = useRouter();
  const { slug } = router.query;
  const { data: userData, status } = useSession({ required: true });

  const articleInfo = api.article.inspect.useQuery((slug as string) || "", {
    retry: false,
  });

  const articleUpdateInfoMutation = api.article.updateInfo.useMutation();
  const articleDeleteMutation = api.article.delete.useMutation();

  const updateInfoIsLoading = articleUpdateInfoMutation.isLoading;

  const [title, setTitle] = useState(articleInfo.data?.title);
  const [description, setDescription] = useState(articleInfo.data?.description);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteModalInput, setDeleteModalInput] = useState("");

  useEffect(() => {
    if (!articleInfo.isError || articleInfo.error.data?.httpStatus !== 404) {
      setTitle(articleInfo.data?.title);
      setDescription(articleInfo.data?.description);
    }
  }, [articleInfo.data, articleInfo.isError, router, articleInfo.error]);

  useEffect(() => {
    if (
      articleUpdateInfoMutation.isSuccess &&
      !articleUpdateInfoMutation.isLoading
    ) {
      articleUpdateInfoMutation.reset();
      router.push(
        "/articles/" + articleUpdateInfoMutation.data.slug + "/inspect"
      );
    }
  }, [articleUpdateInfoMutation, router]);
  useEffect(() => {
    if (articleDeleteMutation.isSuccess && !articleDeleteMutation.isLoading) {
      articleDeleteMutation.reset();
      router.push("/articles");
    }
  }, [articleDeleteMutation, router]);

  type TitleChecks = "isLongerThan20" | "isLongerThan30" | "isLessThan50";
  const TitleScores: {
    [key in TitleChecks]: {
      isValid: boolean;
      failMessage: string;
      successMessage: string;
      importance: "critical" | "warning";
    };
  } = {
    isLongerThan20: {
      isValid: (title?.length || 0) > 20,
      failMessage:
        "Title is too short. It should be at least 20 charecters long.",
      successMessage: "Title is longer than 20 character.",
      importance: "critical",
    },
    isLongerThan30: {
      isValid: (title?.length || 0) > 30,
      failMessage:
        "Title is too short. It should be at least 30 charecters long.",
      successMessage: "Title is longer than 30 character.",
      importance: "critical",
    },
    isLessThan50: {
      isValid: (title?.length || 0) < 50,
      failMessage:
        "Title is too long. It should be at most 50 charecters long.",
      successMessage: "Title is shorter than 50 character.",
      importance: "warning",
    },
  };

  type DescriptionChecks = "isLongerThan80" | "isLessThan220" | "isLessThan280";
  const DescriptionScores: {
    [key in DescriptionChecks]: {
      isValid: boolean;
      failMessage: string;
      successMessage: string;
      importance: "critical" | "warning";
    };
  } = {
    isLongerThan80: {
      isValid: (description?.length || 0) > 80,
      failMessage:
        "Description is too short. It should be at least 80 charecters long.",
      successMessage: "Description is longer than 80 character.",
      importance: "critical",
    },
    isLessThan220: {
      isValid: (description?.length || 0) < 220,
      failMessage:
        "Description is too long. It should be at most 220 charecters long.",
      successMessage: "Description is shorter than 220 character.",
      importance: "warning",
    },
    isLessThan280: {
      isValid: (description?.length || 0) < 280,
      failMessage:
        "Description is too long. It should be at most 280 charecters long.",
      successMessage: "Description is shorter than 280 character.",
      importance: "critical",
    },
  };

  const TitleGreenCount = Object.values(TitleScores).filter(
    (score) => score.isValid
  ).length;
  const TitleYellowCount = Object.values(TitleScores).filter(
    (score) => !score.isValid && score.importance === "warning"
  ).length;
  const TitleRedCount = Object.values(TitleScores).filter(
    (score) => !score.isValid && score.importance === "critical"
  ).length;

  const DescriptionGreenCount = Object.values(DescriptionScores).filter(
    (score) => score.isValid
  ).length;
  const DescriptionYellowCount = Object.values(DescriptionScores).filter(
    (score) => !score.isValid && score.importance === "warning"
  ).length;
  const DescriptionRedCount = Object.values(DescriptionScores).filter(
    (score) => !score.isValid && score.importance === "critical"
  ).length;

  const MetaScore = Math.round(
    ((TitleGreenCount + DescriptionGreenCount) /
      (Object.values(TitleScores).length +
        Object.values(DescriptionScores).length)) *
      100
  );

  const ArticleScore = 50;

  const OverallScore = Math.round((MetaScore + ArticleScore) / 2).toString();

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
          <div className="flex max-w-full">
            <div className="inline-block w-full flex-grow">
              <p className="text-xs text-black/70">Inspect Article</p>
              <h1 className="mt-1 inline-block w-full max-w-full truncate text-2xl font-bold md:max-w-xs lg:max-w-lg xl:max-w-2xl 2xl:max-w-full">
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
                className="mt-4"
              >
                <button className="flex h-full items-center justify-center rounded-lg bg-gray-500 px-4 py-2 text-white">
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
          <div className="flex flex-col justify-center gap-x-2 md:flex-row">
            <div className="max-w-screen-lg flex-grow">
              <div className="mt-4 w-full break-all">
                <span className="text-black/70">Description:</span>

                <p>{articleInfo.data?.description}</p>

                <span className="text-black/70">Tags:</span>

                <p>{articleInfo.data?.keywords.join(", ")}</p>
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
                      <span>Tags</span>
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
                        <p className="ml-1 text-xs italic text-gray-500">
                          {title?.length}/40
                        </p>
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

                            articleUpdateInfoMutation
                              .mutateAsync(mutationData)
                              .then((data) => {
                                articleInfo.refetch;
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
                      <div className="grid grid-cols-3 gap-4 py-4">
                        <div className="flex w-full flex-col gap-y-2 rounded-lg border bg-white p-4 shadow-md">
                          <p className="text-xl">Overall Score</p>
                          <p className="text-2xl font-semibold">
                            {OverallScore}
                            <span className="text-base text-black/50">
                              /100
                            </span>
                          </p>
                        </div>
                        <div className="flex w-full flex-col gap-y-2 rounded-lg border bg-white p-4 shadow-md">
                          <p className="text-xl">Meta Score</p>
                          <p className="text-2xl font-semibold">
                            {MetaScore}
                            <span className="text-base text-black/50">
                              /100
                            </span>
                          </p>
                        </div>
                        <div className="flex w-full flex-col gap-y-2 rounded-lg border bg-white p-4 shadow-md">
                          <p className="text-xl">Article Score</p>
                          <p className="text-2xl font-semibold">
                            {ArticleScore}
                            <span className="text-base text-black/50">
                              /100
                            </span>
                          </p>
                        </div>
                      </div>
                      <hr className="border" />
                      <div className="w-full py-4">
                        <div className="mx-auto flex w-full flex-col gap-4 rounded-2xl bg-white">
                          <Disclosure as={"div"}>
                            {({ open }) => (
                              <>
                                <Disclosure.Button className="flex w-full justify-between rounded-lg border bg-white px-4 py-2 text-left font-medium text-black focus:outline-none focus-visible:ring focus-visible:ring-opacity-75">
                                  <span className="">Title</span>
                                  <div className=" flex items-center gap-4">
                                    <div
                                      className={`flex items-center gap-1 ${
                                        TitleGreenCount == 0 ? "hidden" : ""
                                      }`}
                                    >
                                      <p>{TitleGreenCount}</p>
                                      <div className="h-3 w-3 rounded-full bg-green-700"></div>
                                    </div>
                                    <div
                                      className={`flex items-center gap-1 ${
                                        TitleYellowCount == 0 ? "hidden" : ""
                                      }`}
                                    >
                                      <p>{TitleYellowCount}</p>
                                      <div className=" h-3 w-3 rounded-full bg-yellow-500"></div>
                                    </div>
                                    <div
                                      className={`flex items-center gap-1 ${
                                        TitleRedCount == 0 ? "hidden" : ""
                                      }`}
                                    >
                                      <p>{TitleRedCount}</p>
                                      <div className=" h-3 w-3 rounded-full bg-red-500"></div>
                                    </div>

                                    <ChevronUpIcon
                                      className={`${
                                        open ? "" : "rotate-180 transform"
                                      } h-5 w-5 text-black`}
                                    />
                                  </div>
                                </Disclosure.Button>
                                <Disclosure.Panel className="px-4 pt-2">
                                  {Object.values(TitleScores).map(
                                    (score, index) => {
                                      if (
                                        !score.isValid &&
                                        score.importance === "critical"
                                      ) {
                                        return (
                                          <p
                                            className={`text-red-700`}
                                            key={
                                              "fail-message-title-critical-" +
                                              index
                                            }
                                          >
                                            {score.failMessage}
                                          </p>
                                        );
                                      }
                                    }
                                  )}
                                  {Object.values(TitleScores).map(
                                    (score, index) => {
                                      if (
                                        !score.isValid &&
                                        score.importance === "warning"
                                      ) {
                                        return (
                                          <p
                                            className={`text-yellow-600`}
                                            key={
                                              "fail-message-title-warning-" +
                                              index
                                            }
                                          >
                                            {score.failMessage}
                                          </p>
                                        );
                                      }
                                    }
                                  )}
                                  {Object.values(TitleScores).map(
                                    (Score, index) => {
                                      if (Score.isValid)
                                        return (
                                          <p
                                            className={`text-green-700`}
                                            key={
                                              "succes-message-title-" + index
                                            }
                                          >
                                            {Score.successMessage}
                                          </p>
                                        );
                                    }
                                  )}
                                </Disclosure.Panel>
                              </>
                            )}
                          </Disclosure>
                          <Disclosure as={"div"}>
                            {({ open }) => (
                              <>
                                <Disclosure.Button className="flex w-full justify-between rounded-lg border bg-white px-4 py-2 text-left font-medium text-black focus:outline-none focus-visible:ring focus-visible:ring-opacity-75">
                                  <span className="">Description</span>
                                  <div className=" flex items-center gap-4">
                                    <div
                                      className={`flex items-center gap-1 ${
                                        DescriptionGreenCount == 0
                                          ? "hidden"
                                          : ""
                                      }`}
                                    >
                                      <p>{DescriptionGreenCount}</p>
                                      <div className="h-3 w-3 rounded-full bg-green-700"></div>
                                    </div>
                                    <div
                                      className={`flex items-center gap-1 ${
                                        DescriptionYellowCount == 0
                                          ? "hidden"
                                          : ""
                                      }`}
                                    >
                                      <p>{DescriptionYellowCount}</p>
                                      <div className=" h-3 w-3 rounded-full bg-yellow-500"></div>
                                    </div>
                                    <div
                                      className={`flex items-center gap-1 ${
                                        DescriptionRedCount == 0
                                          ? " hidden"
                                          : ""
                                      }`}
                                    >
                                      <p>{DescriptionRedCount}</p>
                                      <div className=" h-3 w-3 rounded-full bg-red-500"></div>
                                    </div>
                                    <ChevronUpIcon
                                      className={`${
                                        open ? "" : "rotate-180 transform"
                                      } h-5 w-5 text-black`}
                                    />
                                  </div>
                                </Disclosure.Button>
                                <Disclosure.Panel className="px-4 pb-2 pt-2">
                                  {Object.values(DescriptionScores).map(
                                    (score, index) => {
                                      if (
                                        !score.isValid &&
                                        score.importance === "critical"
                                      ) {
                                        return (
                                          <p
                                            className={`text-red-700`}
                                            key={
                                              "fail-message-description-critical-" +
                                              index
                                            }
                                          >
                                            {score.failMessage}
                                          </p>
                                        );
                                      }
                                    }
                                  )}
                                  {Object.values(DescriptionScores).map(
                                    (score, index) => {
                                      if (
                                        !score.isValid &&
                                        score.importance === "warning"
                                      ) {
                                        return (
                                          <p
                                            className={`text-yellow-600`}
                                            key={
                                              "fail-message-description-warning-" +
                                              index
                                            }
                                          >
                                            {score.failMessage}
                                          </p>
                                        );
                                      }
                                    }
                                  )}
                                  {Object.values(DescriptionScores).map(
                                    (Score, index) => {
                                      if (Score.isValid)
                                        return (
                                          <p
                                            className={`text-green-700`}
                                            key={
                                              "success-message-description-" +
                                              index
                                            }
                                          >
                                            {Score.successMessage}
                                          </p>
                                        );
                                    }
                                  )}
                                </Disclosure.Panel>
                              </>
                            )}
                          </Disclosure>
                        </div>
                      </div>
                    </Tab.Panel>
                    <Tab.Panel>
                      <TagTab />
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </div>
            </div>

            <div className="order-first mt-4 grid w-full gap-x-2 self-start rounded-xl border p-2 shadow-md md:order-last md:col-span-2 md:w-auto md:min-w-max md:max-w-md md:flex-shrink md:flex-grow-0 md:grid-cols-[min,min] lg:col-span-1 lg:flex-grow">
              <span className="text-black/70">status:</span>

              <p>
                {articleInfo.data?.isPublished
                  ? "published"
                  : "unpublished/draft"}
              </p>

              {/* <span className="text-black/70">visibility:</span>
              Private, Public, Unlisted

              for subscribers only, for everyone, for subscribers and people with link */}

              <span className="text-black/70 ">updated at:</span>

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
                  className="col-span-2 mb-2 mt-6 flex items-center justify-center rounded-lg bg-gray-500 px-4 py-2 text-white disabled:bg-gray-400 md:mb-0"
                >
                  View
                </Link>
              ) : (
                <button
                  className="col-span-2 mb-2 mt-6 flex items-center justify-center rounded-lg bg-gray-500 px-4 py-2 text-white disabled:bg-gray-400 md:mb-0"
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
                className="my-2 w-full rounded-lg border-2 p-2"
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
                    articleDeleteMutation.mutate(slug as string);
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
