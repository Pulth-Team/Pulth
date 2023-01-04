import type { NextPage } from "next";

import { trpc } from "../utils/trpc";
import Head from "next/head";
import Link from "next/link";

import { useSession } from "next-auth/react";

import DragScrollContainer from "../components/DragScrollContainer";
import ArticleCard from "../components/ArticleCard";
import DashboardLayout from "../components/layouts/dashboard";

const Explore: NextPage = () => {
  const { data } = useSession();
  const user = data?.user;

  const { data: articles } = trpc.useQuery([
    "article.getLatestArticles",
    {
      limit: 10,
      skip: 0,
    },
  ]);

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
          className={`${user ?? "hidden"} text-4xl font-bold mb-4 md:px-0 px-5`}
        >
          Welcome back, <span className="text-indigo-700">{user?.name}</span>
        </h1>
        <div className="flex flex-col gap-y-5">
          <p className="text-2xl font-semibold md:px-0 px-5">
            {user ? "Selected for you..." : "Recent articles"}
          </p>
          <DragScrollContainer>
            {articles?.map((article) => (
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

            {/* <ArticleCard
              Title="Next.js Auth Errors"
              Topics={["Javascript", "Web", "React"]}
              Author={{ Title: "Web Architect", Name: "Bekir Gulestan" }}
              isRecommended={true}
            >
              Some article made for explaining Next Auth Errors deeply. That
              cover nearly 4 (Four) error which is nearly all(102) of them.
            </ArticleCard> */}
          </DragScrollContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Explore;
