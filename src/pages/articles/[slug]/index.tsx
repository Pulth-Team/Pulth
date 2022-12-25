import type { NextPage } from "next";

import { trpc } from "../../../utils/trpc";
import Head from "next/head";
import { useRouter } from "next/router";

import DashboardLayout from "../../../components/layouts/dashboard";
import ArticleError from "../../../components/responses/ArticleError";
import dynamic from "next/dynamic";
import DocumentRenderer, {
  OutputBlockType,
} from "../../../components/editor/renderer/DocumentRenderer";

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

const Articles: NextPage = () => {
  const router = useRouter();
  const { slug } = router.query;

  const articleData = trpc.useQuery([
    "article.getArticleBySlug",
    { slug: slug as string },
  ]);

  let blocks: OutputBlockType[] = [];
  if (articleData.data?.bodyData) {
    blocks = articleData.data.bodyData as unknown as OutputBlockType[];
  }
  return (
    <DashboardLayout>
      <Head>
        <title>{articleData.data?.title} - Pulth App</title>
        <meta
          name="description"
          content="articles dor your usage of pulth. join our community now!"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* read article container for our article renderer with media queries */}
      <div className="p-4 container max-w-2xl mx-auto">
        {articleData.data?.error ? (
          <p>{articleData.data.error}</p>
        ) : (
          <DocumentRenderer blocks={blocks} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Articles;
