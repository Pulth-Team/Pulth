import type { NextPage } from "next";

import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/legacy/image";
import Link from "next/link";

import { signIn, useSession } from "next-auth/react";
import { useMemo, useState,useEffect } from "react";
import {
  SparklesIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  // TODO: later add these icons to use
  BookmarkIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

import { api } from "~/utils/api";

import DashboardLayout from "~/components/layouts/gridDashboard";
import DocumentRenderer from "~/components/editor/renderer/DocumentRenderer";
import CommentAdd, { AddCommentData } from "~/components/editor/addComment";
import CommentAlgo from "~/components/editor/CommentAlgo";
import Loading from "~/components/Loading";

import { createServerSideHelpers } from "@trpc/react-query/server";
import { GetStaticPaths, GetStaticPropsContext } from "next";

// import { prisma } from "server/context";
import { appRouter } from "~/server/api/root";

import superjson from "superjson";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { prisma } from "~/server/db";

const Articles: NextPage = () => {
  const router = useRouter();
  const { data: userData, status: authStatus } = useSession();
  const { slug } = router.query;
  const [voteRank, setVoteRank] = useState(0);
  const [myVote, setMyVote] = useState<"up" | "down" | "none">("none");

  // query to get the article data
  const articleData = api.article.getBySlug.useQuery((slug as string) || "", {
    onSuccess: (data) => {
      setVoteRank(data.voteRank);
    },
  });

  // mutation to add a comment
  const commentAddMutation = api.comment.create.useMutation();
  // mutation to add a vote
  const voteAddMutation = api.vote.voteByArticleId.useMutation({
    onSuccess: (data) => {
      setVoteRank(data.newRank);
    },
  });

  // query to get my vote automatically
  api.vote.checkMyVoteByArticleId.useQuery(
    articleData.data?.id as string,
    {
      enabled: authStatus === "authenticated" && articleData.data?.id !== null,
      onSuccess: (data) => {
        // check if there is a msg prop
        if ("msg" in data) {
          setMyVote("none");
        } else {
          // otherwise set the vote to the data vote
          setMyVote(data.upVote ? "up" : "down");
        }
      },
    }
  );

  const OnCommentAdd = (comment: AddCommentData) => {
    // todo open a modal  for the comment
    commentAddMutation.mutate(
      {
        articleId: articleData.data?.id as string,
        content: comment.content,
        parentId: comment.parent,
      },
      {
        onSuccess: () => {
          // refetch the article data
          // to get the updated comments
          articleData.refetch();
        },
      }
    );
  };

  let userImage = userData?.user?.image;
  if (userImage === null) userImage = undefined;

  // memoize the document renderer
  // if the blocks don't change
  // so that it doesn't re-render on every re-render
  // this is a performance optimization technique called memoization or memoization caching
  const RenderedDocument = useMemo(
    () => <DocumentRenderer blocks={articleData.data?.bodyData || []} />,
    [articleData.data?.bodyData]
  );

  let body = (
    <>
      {/* this might be a bad idea but lets keep that here for now */}
      <h1 className="m-0 mb-2 p-0 text-3xl font-bold">
        {!articleData.data?.title && "Article Not Found"}
      </h1>

      {!articleData.data?.id && (
        <div>
          <p className="mb-4">
            Article not found. Maybe it&apos;s been deleted by the author.
            <br /> Or just never existed. Who knows? 🤷‍♂️ <br />
          </p>
          <Link
            href="/dashboard"
            className="my-2 rounded-md bg-indigo-500 p-2 text-white"
          >
            Go back to home
          </Link>
        </div>
      )}

      {RenderedDocument}

      {/* Rank and action buttons */}
      {articleData.data?.id && (
        <div className="mb-6 mt-8 flex flex-row justify-between">
          <div className="flex gap-4">
            <div className="flex gap-2">
              <SparklesIcon className="h-6 w-6 text-black" />
              {/* {voteAddMutation.data
              ? voteAddMutation.data.newRank
              : articleData.data?.voteRank || 0} */}
              {voteAddMutation.isLoading ? (
                <Loading className="h-6 w-6 border-2" />
              ) : (
                voteRank
              )}
            </div>
            <button
              onClick={() => {
                if (authStatus !== "authenticated") {
                  signIn();
                  return;
                } else {
                  voteAddMutation.mutate(
                    {
                      articleId: articleData.data?.id as string,
                      vote: "up",
                    },
                    {
                      onSuccess: (data) => {
                        if (data.voteDirection == "deleted") setMyVote("none");
                        else setMyVote("up");
                      },
                    }
                  );
                }
              }}
            >
              <ChevronUpIcon
                className={`h-6 w-6 ${
                  myVote !== "none" && myVote === "up"
                    ? "text-indigo-500"
                    : " text-black"
                }`}
              />
            </button>
            <button
              onClick={() => {
                if (authStatus !== "authenticated") {
                  signIn();
                  return;
                } else {
                  voteAddMutation.mutate(
                    {
                      articleId: articleData.data?.id as string,
                      vote: "down",
                    },
                    {
                      onSuccess: (data) => {
                        if (data.voteDirection == "deleted") setMyVote("none");
                        else setMyVote("down");
                      },
                    }
                  );
                }
              }}
            >
              <ChevronDownIcon
                className={`h-6 w-6 ${
                  myVote !== "none" && myVote === "down"
                    ? "text-indigo-500"
                    : " text-black"
                }`}
              />
            </button>
          </div>
          <div></div>
          {/* TODO: Add share and bookmark functionality */}
          {/* Will be added later */}
          {/* <div className="flex gap-4">
          <ArrowUpTrayIcon className="h-6 w-6 text-black" />
          <BookmarkIcon className="h-6 w-6 text-black" />
        </div> */}
        </div>
      )}

      {/* About the author */}
      {articleData.data?.author && (
        <div className="mt-4 flex items-center justify-between md:px-4">
          <div className="flex items-center gap-x-3">
            <div className="relative h-12 w-12 ">
              <Image
                layout="fill"
                src={articleData.data?.author.image || "/default_profile.jpg"}
                alt={articleData.data?.author.name || "unknown"}
                className=" rounded-full"
              />
            </div>
            <p className="sm:text-base md:text-lg font-semibold ">
              {articleData.data?.author.name || "unknown"}
            </p>
          </div>

          <div className="flex gap-2">
            {/* TODO: ADD subs icon (prime like) */}
            {articleData.data?.author.id === userData?.user.id && (
              <Link
                // href={`/user/${articleData.data?.author.id}`}
                href={{
                  pathname: `/articles/[slug]/inspect`,
                  query: { slug: slug },
                }}
                className="rounded-lg bg-gray-500 px-4 py-2 text-white"
              >
                Inspect
              </Link>
            )}
            <Link
              // href={`/user/${articleData.data?.author.id}`}
              href={{
                pathname: `/user/[userId]`,
                query: { userId: articleData.data?.author.id },
              }}
              className="rounded-lg bg-indigo-500 px-4 py-2 text-white"
            >
              Visit
            </Link>
          </div>
        </div>
      )}

      {articleData.data?.Comments && (
        <div className="py-4">
          <p className="text-lg font-semibold">
            <span className="font-medium">
              {articleData.data?.Comments?.length + " "}
            </span>
            Comments
          </p>
          <hr className="mb-2" />
          <div className="flex flex-col ">
            {authStatus == "authenticated" ? (
              <CommentAdd
                user={{
                  name: userData?.user?.name as string,
                  image: userImage || "default_profile.jpg",
                }}
                OnComment={OnCommentAdd}
                isLoading={commentAddMutation.isLoading}
              />
            ) : (
              <button
                className="flex items-center justify-center rounded-lg bg-gray-600 py-4 text-white"
                onClick={() => signIn()}
              >
                Login to comment
              </button>
            )}

            <hr className="my-2" />

            <CommentAlgo
              comments={articleData.data?.Comments || []}
              user={{
                id: userData?.user?.id as string,
                name: userData?.user?.name as string,
                image: userImage || "/default_profile.jpg",
              }}
              isAuthed={authStatus == "authenticated"}
              articleId={articleData.data?.id as string}
              revalidate={articleData.refetch}
            />
          </div>
        </div>
      )}
    </>
  );
  return (
    <DashboardLayout>
      <Head>
        <title>
          {(articleData.data?.title || "unnamed").toString() + " - Pulth App"}
        </title>
        <meta name="description" content={articleData.data?.description} />
        <meta name="author" content={articleData.data?.author?.name!} />
        <meta name="generator" content="Pulth Engine" />
        <link rel="icon" href="/favicon.ico" />
        {/* Add keywords */}
      </Head>
      {/* read article container for our article renderer with media queries */}
      <div className="container mx-auto max-w-2xl p-4">
        {body}
        {/* Add Comments, Tags, AuthorBox, Action Button */}
      </div>
    </DashboardLayout>
  );
};

export default Articles;

export async function getStaticProps(
  context: GetStaticPropsContext<{ slug: string }>
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: null,req: null, res: null }),
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug as string;

  // prefetch `article.getBySlug`
  await helpers.article.getBySlug.prefetch(slug);

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  const articles = await prisma.article.findMany({
    select: {
      slug: true,
    },
  });

  // Get the paths we want to pre-render based on posts
  // currently we only give the slug but we can also give the locale or params
  const paths: string[] = articles.map(
    (article) => `/articles/${article.slug}`
  );

  return {
    paths: paths,
    // https://nextjs.org/docs/pages/api-reference/functions/get-static-paths#fallback-blocking
    fallback: "blocking",
  };
};
