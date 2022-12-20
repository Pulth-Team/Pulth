import type { NextPage } from "next";

import { trpc } from "../../../utils/trpc";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { useSession } from "next-auth/react";
import {} from "@trpc/client";

import type { Prisma } from "@prisma/client";
import DashboardLayout from "../../../components/layouts/dashboard";
import ArticleError from "../../../components/responses/ArticleError";
import dynamic from "next/dynamic";
import { useState } from "react";
import Loading from "../../../components/Loading";

const Editor = dynamic(() => import("../../../components/Editor"), {
  ssr: false,
});

// this component's experience is not good
// the code itself is not good
// but it works
// so I will leave it as it is for now
// and I will fix it later

// TODO: fix this component
// bad parts:
// - the channel between backend and frontend is not good
// - the code is not good
// - the experience is not good
// - the not supporting SSG
// - the not supporting SSR (maybe, I don't know)

interface InitialArticleProps {
  article:
    | {
        id: string;
        author: {
          name: string | null;
          email: string | null;
          image: string | null;
        };
        title: string;
        description: string;
        bodyData: Prisma.JsonValue;
        isPublished: boolean;
      }
    | {
        error: string;
        code?: number;
      };
}

const Articles: NextPage<InitialArticleProps> = ({ article: articleInfo }) => {
  const router = useRouter();
  const { slug } = router.query;

  const articleData = trpc.useQuery([
    "article.getArticleBySlug",
    { slug: slug as string },
  ]);

  return (
    <DashboardLayout>
      <Head>
        <title>{"Title"} - Pulth App</title>
        <meta
          name="description"
          content="articles dor your usage of pulth. join our community now!"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="p-4">
        {/* {"error" in article && !("code" in article) ? (
          <ArticleError title={article.error} desc={articleErrorText} />
        ) : (
          <article>
            <Editor data={{ blocks: article.bodyData }} readonly={false} />
          </article>
        )} */}

        {articleData.isLoading ? (
          <Loading className="w-12 h-12 border-2" />
        ) : (
          "LOADED and authentificated"
        )}
      </div>
    </DashboardLayout>
  );
};

export default Articles;
