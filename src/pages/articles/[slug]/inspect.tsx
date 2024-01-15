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
import { Tab, Dialog } from "@headlessui/react";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import Head from "next/head";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

import superjson from "superjson";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { createTRPCContext } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";
import { DehydratedState } from "@tanstack/react-query";

import TagTab from "~/components/Tabs/TagTab";
import SEOTab from "~/components/Tabs/SEOTab";
import InspectContext from "~/components/contexts/Inspect";
import InspectorNavbar from "~/components/inspect/Navbar";
import SideContainer from "~/components/inspect/sideContainer";

const Inspect: NextPage = () => {
  dayjs.extend(relativeTime);
  const router = useRouter();
  const { slug } = router.query;
  const { data: userData, status } = useSession({ required: true });

  const articleInfo = api.article.inspect.useQuery(
    { slug: slug as string },
    {
      retry: false,
    }
  );

  // const { data: tagData, isLoading: isTagsLoading } =
  //   api.tag.getTagsBySlug.useQuery({
  //     slug: slug as string,
  //   });

  const articleUpdateInfoMutation = api.article.updateInfo.useMutation();

  const updateInfoIsLoading = articleUpdateInfoMutation.isLoading;

  const [title, setTitle] = useState(articleInfo.data?.title);
  const [description, setDescription] = useState(articleInfo.data?.description);

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

  return (
    <Dashboard>
      <Head>
        <title>{articleInfo.data?.title}</title>
      </Head>
      <InspectContext.Provider
        value={{
          slug: slug as string,
          // id: articleInfo.data?.id ?? "-1",
          title: articleInfo.data?.title ?? "",
          description: articleInfo.data?.description ?? "",
          keywords: articleInfo.data?.keywords ?? [],
          Tags:
            articleInfo.data?.tags.map((val) => ({
              name: val.tag.name,
              slug: val.tag.slug,
            })) ?? [],

          createdAt: articleInfo.data?.createdAt ?? new Date(),
          updatedAt: articleInfo.data?.updatedAt ?? new Date(),

          isPublished: articleInfo.data?.isPublished ?? false,

          refetch: articleInfo.refetch,
        }}
      >
        {articleInfo.isError ? (
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
            <InspectorNavbar />
            <hr className="mt-1 border-black" />

            {/* TODO: If this was grid, i would be very good DX/UX */}
            <div className="flex flex-col justify-center gap-x-2 md:flex-row">
              <div className="max-w-screen-lg flex-grow">
                <div className="mt-4 w-full break-all">
                  <span className="text-black/70">Description:</span>
                  <p>{articleInfo.data?.description}</p>

                  <p className="mt-4 text-black/70">Tags:</p>
                  <p>
                    {articleInfo.data?.tags
                      .map((tagEntry) => tagEntry.tag.name)
                      .join(", ")}
                  </p>
                </div>
                {/* <hr className="border-4" /> */}
                <div className="mt-2">
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
                              (description?.length || 0) > 320 &&
                                "text-red-500",
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
                                description ===
                                  articleInfo.data?.description) ||
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

                              if (
                                description !== articleInfo.data?.description
                              ) {
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
                        {/* TODO: Instead of proping data to components in inspectPage, We should use Context instead*/}
                        <SEOTab
                          title={title ?? ""}
                          description={description ?? ""}
                          keywords={articleInfo.data?.keywords!}
                          slug={slug as string}
                        />
                      </Tab.Panel>
                      <Tab.Panel>
                        <TagTab />
                      </Tab.Panel>
                    </Tab.Panels>
                  </Tab.Group>
                </div>
              </div>
              <SideContainer />
            </div>
          </div>
        )}
      </InspectContext.Provider>
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
  const inspectPre = helpers.article.inspect.prefetch({ slug: slug || "" });

  // prefetch `tag.getTagsBySlug`
  const tagPre = helpers.tag.getTagsBySlug.prefetch({
    slug,
  });

  // wait for both prefetches to finish
  await Promise.all([inspectPre, tagPre]);

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
};

export default Inspect;
