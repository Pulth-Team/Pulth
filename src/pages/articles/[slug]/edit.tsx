import type { NextPage } from "next";

import { trpc } from "../../../utils/trpc";
import Head from "next/head";

import ArticleError from "../../../components/responses/ArticleError";
import Loading from "../../../components/Loading";
import DashboardLayout from "../../../components/layouts/dashboard";

// load editor only on client side
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import dynamic from "next/dynamic";
const Editor = dynamic(() => import("../../../components/Editor"), {
  ssr: false,
});

const Articles: NextPage = ({}) => {
  const { status } = useSession({ required: true });
  const [isFetching, setIsFetching] = useState(true);

  const router = useRouter();
  const { slug } = router.query;

  const articleAuthorFetch = trpc.useQuery(
    ["article.getArticleBySlugAuthor", { slug: slug as string }],
    {
      enabled: status === "authenticated",
      //   refetchOnWindowFocus: false,
      //   refetchOnMount: false,
      //   refetchOnReconnect: false,
      //   refetchInterval: false,
      //   refetchIntervalInBackground: false,
    }
  );

  useEffect(() => {
    if (articleAuthorFetch.isSuccess && status === "authenticated")
      setIsFetching(false);
  }, [status, articleAuthorFetch.isSuccess]);

  return (
    <DashboardLayout>
      <Head>
        <title>Edit Mode - Pulth App</title>
      </Head>
      <div className="p-4">
        {!isFetching ? (
          articleAuthorFetch.data ? (
            <Editor
              readonly={false}
              data={{
                time: articleAuthorFetch.data.updatedAt,
                blocks: articleAuthorFetch.data.bodyData,
                version: articleAuthorFetch.data.editorVersion,
              }}
            />
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
    </DashboardLayout>
  );
};

export default Articles;
