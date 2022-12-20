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

  // TODO: add type for articleData
  const [articleData, setArticleData] = useState<any>({});
  let Title;

  let articleErrorText = "";

  if ("error" in articleInfo) {
    switch (articleInfo.error) {
      case "No Slug detected":
        articleErrorText =
          "There is no slug detected. Please try again with valid slug.";
        Title = "No Slug ";
        break;
      case "Article not published":
        articleErrorText =
          "The article you are looking for is not published or does not exist.";
        Title = "Article not published";
        break;
      case "Article not found":
        articleErrorText =
          "There is no article with this url. Maybe it was deleted?";
        Title = "Article not found";
        break;
    }
  }
  if ("code" in articleInfo && articleInfo.code == 4001) {
    trpc.useQuery(["article.getArticleBySlug", { slug: slug as string }], {
      onSuccess: (data) => {
        setArticleData(data);
      },
    });
  }

  const Bodyfn = () => {
    if ("error" in articleInfo && !("code" in articleInfo)) {
      return <ArticleError title={articleInfo.error} desc={articleErrorText} />;
    } else {
      if ("code" in articleInfo && articleInfo.code == 4001) {
        const article = trpc.useQuery(
          ["article.getArticleBySlug", { slug: slug as string }],
          {
            onSuccess: (data) => {
              setArticleData(data);
            },
          }
        );

        if (article.status === "loading") {
          return <p>Loading...</p>;
        }
        if (article.status === "success") {
          console.log("there is code 4001");
          Title = article.data.title;
          return (
            <article>
              <Editor
                data={{ blocks: article.data.bodyData }}
                readonly={false}
              />
            </article>
          );
        }
      }

      // TODO: fix this type issue later
      Title = articleInfo.title!;
      return (
        <article>
          {/* solve type issue */}
          <Editor data={{ blocks: articleInfo.bodyData! }} readonly={false} />
        </article>
      );
    }
  };
  // dummy solution fix this later
  const Body = Bodyfn();

  return (
    <DashboardLayout>
      <Head>
        <title>{Title} - Pulth App</title>
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
        {Body}
      </div>
    </DashboardLayout>
  );
};

Articles.getInitialProps = async (ctx): Promise<InitialArticleProps> => {
  const { slug } = ctx.query;

  if (typeof slug === "undefined") {
    return {
      article: {
        error: "No Slug detected",
      },
    } as InitialArticleProps;
  }
  if (Array.isArray(slug)) {
    return {
      article: {
        error: "Article not found",
      },
    } as InitialArticleProps;
  }

  let article;
  //check is server or client
  if (typeof window === "undefined") {
    const articleQuery = await prisma?.article.findUnique({
      where: {
        slug: slug,
      },
      select: {
        id: true,
        title: true,
        description: true,
        bodyData: true,
        author: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        isPublished: true,
      },
    });
    if (!articleQuery?.isPublished)
      return {
        article: {
          error: "Article not published",
        },
      } as InitialArticleProps;

    return {
      article: { ...articleQuery } as InitialArticleProps["article"],
    };
  } else {
    // client side
    return {
      article: {
        error: "client-side request detected. Please fetch via tRPC",
        code: 4001,
      },
    };
  }
};

export default Articles;