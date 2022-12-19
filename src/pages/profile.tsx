import type { NextPage } from "next";

import { trpc } from "../utils/trpc";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

import { useSession } from "next-auth/react";

import DashboardLayout from "../components/layouts/dashboard";
import DragScrollContainer from "../components/DragScrollContainer";
import ArticleCard from "../components/ArticleCard";
import { PlusIcon } from "@heroicons/react/24/outline";
import MyArticleCard from "../components/editor/MyArticleCard";

const Articles: NextPage = () => {
  const { data } = useSession({ required: true });
  const user = data?.user;

  const articleData = trpc.useQuery([
    "article.getUserArticleInfos",
    { userId: user?.id },
  ]);

  console.log(articleData);
  return (
    <DashboardLayout>
      <Head>
        <title>Profile - Pulth App</title>
        <meta name="description" content="Your Profile in Pulth" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="p-4">
        <h2>
          <span className="text-2xl font-bold">My Articles</span>
        </h2>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {articleData.data?.map((article) => (
            <MyArticleCard
              key={article.slug}
              title={article.title}
              description={article.description}
              slug={article.slug}
              // image={article.image}
            />
          ))}

          {/* Add Project div */}
          <Link href="/articles/new">
            <button className="col-span-1 group bg-white border-dashed border-2 rounded-md hover:border-solid hover:border-indigo-500 flex flex-col justify-center items-center">
              <PlusIcon className="w-6 h-6 group-hover:text-indigo-500"></PlusIcon>
              <p className="group-hover:text-indigo-500 text-sm leading-6 font-medium">
                Create New Article
              </p>
            </button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Articles;
