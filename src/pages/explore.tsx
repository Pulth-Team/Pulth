import type { NextPage } from "next";

import { api } from "../utils/api";
import Head from "next/head";

import { useSession } from "next-auth/react";

import DragScrollContainer from "~/components/DragScrollContainer";
import ArticleCard from "~/components/ArticleCard";
import DashboardLayout from "~/components/layouts";

import dynamic from "next/dynamic";
import Link from "next/link";
const Tour = dynamic(() => import("~/components/Tour"), { ssr: false });

const Explore: NextPage = () => {
  const { data } = useSession();
  const user = data?.user;

  const { data: latestArticles, isLoading: isLatestLoading } =
    api.article.getLatest.useQuery({
      limit: 10,
      skip: 0,
    });

  const { data: popularTags, isLoading: isPopularTagsLoading } =
    api.tag.getPopularTags.useQuery();
  const { data: followedArticles } =
    api.followSystem.getRecentActivity.useQuery(undefined, {
      enabled: typeof user !== "undefined",
    });

  return (
    <DashboardLayout>
      <Head>
        <title>Explore - Pulth App</title>
        <meta
          name="description"
          content="Explore new posts in Pulth. You can read new articles and watch new courses here"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col gap-y-4 px-0 md:px-5">
        <h1
          className={`${user ?? "hidden"} mb-4 px-5 text-4xl font-bold md:px-0`}
        >
          Welcome back, <span className="text-indigo-700">{user?.name}</span>
        </h1>
        <div className="flex flex-col gap-y-5">
          <p className="px-5 text-2xl font-semibold md:px-0">
            Popular in Pulth
          </p>
          <DragScrollContainer id="tag-recom-scroll">
            {!isPopularTagsLoading &&
              popularTags?.map((val) => {
                return (
                  <Link
                    className="shrink-0 rounded-lg bg-gray-800 px-2 py-1 text-sm text-white"
                    key={val.id}
                    href={`/tags/${val.slug}`}
                  >
                    {val.name}
                  </Link>
                );
              })}
          </DragScrollContainer>
          <DragScrollContainer id="recom-scroll">
            {isLatestLoading
              ? [0, 1, 2, 3].map((val, index) => (
                  <div
                    className={`flex min-w-[256px] max-w-xs flex-shrink-0 animate-pulse flex-col gap-y-1 rounded-xl bg-gray-100 p-4`}
                    key={index}
                  >
                    <p className="mb-1 line-clamp-1 h-6 w-full cursor-pointer rounded-lg bg-gray-300 text-xl font-semibold"></p>
                    <div className="mt-2 flex flex-col gap-y-1">
                      <div className="h-4 w-full rounded-full bg-gray-200"></div>
                      <div className="flex gap-2">
                        <div className="h-4 w-full rounded-full bg-gray-200"></div>
                        <div className="h-4 w-24 rounded-full bg-gray-200"></div>
                      </div>
                      <div className="h-4 w-full rounded-full bg-gray-200"></div>
                      <div className="flex gap-2">
                        <div className="h-4 w-24  rounded-full bg-gray-200"></div>
                        <div className="h-4 w-full rounded-full bg-gray-200"></div>
                      </div>
                      <div className="h-4 w-3/5 rounded-full bg-gray-200"></div>
                    </div>

                    <div className="mt-4 flex flex-row items-center justify-center gap-2">
                      <div className="h-9 w-9 flex-shrink-0 rounded-full bg-gray-300"></div>
                      <div className="flex w-full flex-col gap-y-2">
                        <div className="h-3 w-3/4 rounded-full bg-gray-300"></div>
                        <div className="h-3 w-2/5 rounded-full bg-gray-300"></div>
                      </div>
                    </div>
                  </div>
                ))
              : latestArticles?.map((article) => (
                  <ArticleCard
                    Title={article.title}
                    // Topics={article.topics}
                    Author={{
                      // Title: article.author.title,
                      Name: article.author.name!,
                      Image: article.author.image!,
                      UserId: article.author.id,
                    }}
                    createdAt={article.createdAt}
                    isRecommended={false}
                    key={article.slug}
                    slug={article.slug}
                  >
                    {article.description}
                  </ArticleCard>
                ))}
          </DragScrollContainer>

          {followedArticles?.length === 0 || typeof user === "undefined" ? (
            ""
          ) : (
            <>
              <p className="px-5 text-2xl font-semibold md:px-0">
                Recent articles from your follows
              </p>
              <DragScrollContainer>
                {followedArticles?.map((article) => (
                  <ArticleCard
                    Title={article.title}
                    createdAt={article.createdAt}
                    isRecommended={false}
                    slug={article.slug}
                    Author={{
                      Name: article.author.name!,
                      Image: article.author.image!,
                      UserId: article.author.id,
                    }}
                    //
                    key={article.slug}
                  >
                    {article.description}
                  </ArticleCard>
                ))}
              </DragScrollContainer>
            </>
          )}
          <Tour
            className="w-96"
            start={"redirect"}
            redirect="/profile"
            tours={[
              {
                message:
                  'This is a article recommendation for you. You can click "Go to Article" button to read the article.',
                default: {
                  direction: "bottom",
                  align: "center",
                  targetQuery: "#recom-scroll",
                  className: "my-2",
                },
              },
              {
                message:
                  "This is your current account. you can click to it. It will open a menu. You can view your profile, settings and logout from there.",

                default: {
                  // targetQuery: "#current-account-box",
                  targetQuery: "#mobile-account-box",
                  direction: "bottom",
                  align: "end",
                  className: "w-64 mt-2",
                },

                mediaQueries: [
                  {
                    targetQuery: "#current-account-box",
                    taildwindQuery: "md",
                    direction: "right",
                    align: "end",
                    className: "ml-2 -translate-y-2",
                  },
                ],
              },
              {
                message: "You can view your profile by clicking this button.",

                showOn: ["md", "lg", "xl", "2xl"],
                default: {
                  targetQuery: "#view-profile-btn",
                  direction: "right",
                  align: "end",
                  className: "translate-y-2 w-64",
                },
              },
            ]}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Explore;
