import type { NextPage } from "next";
import EditorJS from "@editorjs/editorjs";

import { trpc } from "../../../utils/trpc";
import Head from "next/head";

import ArticleError from "../../../components/responses/ArticleError";
import Loading from "../../../components/Loading";
import EditorTopbar from "../../../components/editor/EditorTopbar";
import DashboardLayout from "../../../components/layouts/dashboard";

// load editor only on client side
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

import dynamic from "next/dynamic";
const Editor = dynamic(() => import("../../../components/Editor"), {
  ssr: false,
});

const Articles: NextPage = ({}) => {
  const { status } = useSession({ required: true });
  const [isFetching, setIsFetching] = useState(true);
  const [bodyData, setBodyData] = useState<any>(null);
  const router = useRouter();
  const { slug } = router.query;

  const [editor, setEditor] = useState<EditorJS | null>(null);

  const handleInit = useCallback((instance: EditorJS) => {
    setEditor(instance);
  }, []);

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
  const articleUpdateBodyFetch = trpc.useQuery(
    [
      "article.updateArticleBody",
      {
        slug: slug as string,
        bodyData,
      },
    ],
    {
      enabled: false,
    }
  );

  useEffect(() => {
    if (articleAuthorFetch.isSuccess && status === "authenticated")
      setIsFetching(false);
  }, [status, articleAuthorFetch.isSuccess]);

  useEffect(() => {
    if (bodyData) {
      articleUpdateBodyFetch.refetch();
    }
  }, [bodyData]);

  const OnSave = () => {
    editor?.save().then((outputData) => {
      console.log(outputData);
      setBodyData(outputData.blocks);
    });
    // console.log(editor);
  };
  return (
    <DashboardLayout>
      <Head>
        <title>Edit Mode - Pulth App</title>
      </Head>
      <div>
        {!isFetching ? (
          articleAuthorFetch.data ? (
            <div>
              <EditorTopbar
                slug={slug as string}
                onSave={OnSave}
                saveLoading={articleUpdateBodyFetch.isLoading}
              />
              <Editor
                readonly={false}
                data={{
                  time: articleAuthorFetch.data.updatedAt,
                  blocks: articleAuthorFetch.data.bodyData,
                  version: articleAuthorFetch.data.editorVersion,
                }}
                OnInit={handleInit}
              />
            </div>
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
