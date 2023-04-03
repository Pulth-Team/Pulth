import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Loading from "~/components/Loading";
import Dashboard from "~/components/layouts/gridDashboard";
import { api } from "~/utils/api";
import { Tab } from "@headlessui/react";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { useEffect, useState } from "react";

const Inspect: NextPage = () => {
  dayjs.extend(relativeTime);
  const router = useRouter();
  const { slug } = router.query;
  const { data: userData, status } = useSession({ required: true });

  const articleInfo = api.article.inspect.useQuery((slug as string) || "");
  const infoIsLoading = articleInfo.isLoading;

  const articleUpdateInfoMutation = api.article.updateInfo.useMutation();
  const updateInfoIsLoading = articleUpdateInfoMutation.isLoading;

  const [title, setTitle] = useState(articleInfo.data?.title);
  const [description, setDescription] = useState(articleInfo.data?.description);

  useEffect(() => {
    setTitle(articleInfo.data?.title);
    setDescription(articleInfo.data?.description);
  }, [articleInfo.data]);

  return (
    <Dashboard>
      <div className="py-8 px-4 ">
        <div className="flex flex-row">
          <div className="flex-grow">
            <p className="text-xs text-black/70">Inspect Article</p>
            <h1 className="mt-1 text-2xl font-bold">
              {infoIsLoading ? (
                <Loading className="h-7 w-7 border-2" />
              ) : (
                articleInfo.data?.title
              )}
            </h1>
          </div>
          <div className="hidden gap-4 md:flex ">
            <button className="mt-4 flex items-center justify-center rounded-lg bg-gray-500 px-4 py-2 text-white">
              Edit
            </button>
            <button className="mt-4 flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-white">
              Delete
            </button>
          </div>
        </div>
        <hr className="mt-1 border-black" />
        <div className="mt-4">
          <span className="text-black/70">Description:</span>

          {infoIsLoading ? (
            <Loading className="h-7 w-7 border-2" />
          ) : (
            <p>{articleInfo.data?.description}</p>
          )}

          <span className="text-black/70">Tags:</span>
          {infoIsLoading ? (
            <Loading className="h-7 w-7 border-2" />
          ) : (
            <p>{articleInfo.data?.keywords.join(", ")}</p>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-2 px-2 py-4">
          <span className="text-black/70">status:</span>
          {infoIsLoading ? (
            <Loading className="h-7 w-7 border-2" />
          ) : (
            <p>
              {articleInfo.data?.isPublished
                ? "published"
                : "unpublished/draft"}
            </p>
          )}

          {/* <span className="text-black/70">visibility:</span>
              Private, Public, Unlisted

              for subscribers only, for everyone, for subscribers and people with link */}

          <span className="text-black/70">published at:</span>
          {infoIsLoading ? (
            <Loading className="h-7 w-7 border-2" />
          ) : (
            <p>{dayjs(articleInfo.data?.updatedAt).fromNow()}</p>
          )}

          <span className="text-black/70">created at:</span>
          {infoIsLoading ? (
            <Loading className="h-7 w-7 border-2" />
          ) : (
            <p>{dayjs(articleInfo.data?.createdAt).fromNow()}</p>
          )}

          <Link href={"/articles/" + slug}>
            <button className="mb-2 mt-6 flex items-center justify-center rounded-lg bg-gray-500 px-4 py-2 text-white">
              View
            </button>
          </Link>
          <Link href={"/articles/" + slug + "/edit"}>
            <button className="mt-6 mb-2 flex items-center justify-center rounded-lg bg-gray-500 px-4 py-2 text-white">
              Edit
            </button>
          </Link>
          <button className="flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-white">
            {articleInfo.data?.isPublished ? "Unpublish" : "Publish"}
          </button>
          <button className="flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-white">
            Delete
          </button>
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
                          relative flex w-full items-center justify-center py-2 px-4 focus:outline-none`
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
                          relative flex w-full items-center justify-center py-2 px-4 focus:outline-none`
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
                          relative flex w-full items-center justify-center py-2 px-4 focus:outline-none`
                }
              >
                <span>Stats</span>
              </Tab>
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel>
                <div className="mt-4 flex flex-col">
                  <span className="text-black/70">Title:</span>

                  {infoIsLoading ? (
                    <Loading className="h-7 w-7 border-2" />
                  ) : (
                    <input
                      className="border-2 p-3 outline-indigo-500"
                      value={title || ""}
                      onChange={(e) => {
                        setTitle(e.target.value);
                      }}
                    />
                  )}
                </div>
                <div className="mt-4 flex flex-col">
                  <span className="text-black/70">Description:</span>

                  {infoIsLoading ? (
                    <Loading className="h-7 w-7 border-2" />
                  ) : (
                    <textarea
                      className="border-2 p-3 outline-indigo-500"
                      value={description || ""}
                      onChange={(e) => {
                        setDescription(e.target.value);
                      }}
                    />
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    className="mt-6 mb-2 flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-white disabled:bg-indigo-400"
                    disabled={
                      title === "" ||
                      description === "" ||
                      (title === articleInfo.data?.title &&
                        description === articleInfo.data?.description)
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
                            description === articleInfo.data?.description),
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
                          router.replace("/articles/" + data.slug + "/inspect");
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
                    className="mt-6 mb-2 flex items-center justify-center rounded-lg bg-gray-500 px-4 py-2 text-white disabled:bg-gray-400"
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
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </Dashboard>
  );
};

export default Inspect;
