import type { NextPage } from "next";

import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/legacy/image";
import Link from "next/link";
import { getBaseUrl } from "~/utils/api";

import { signIn, useSession } from "next-auth/react";
import { useMemo } from "react";
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

  // query to get the article data
  const articleData = api.article.getBySlug.useQuery((slug as string) || "");
  //query to get the comment data
  const commentData = api.comment.getBySlug.useQuery((slug as string) || "");

  // query to get the vote rank
  const voteRankQuery = api.vote.getVoteRankByArticleId.useQuery(
    articleData.data?.id as string,
    {
      enabled: articleData.data?.id !== null,
    }
  );

  // mutation to add a vote
  const voteAddMutation = api.vote.voteByArticleId.useMutation();

  // query to get my vote automatically
  const myVoteQuery = api.vote.checkMyVoteByArticleId.useQuery(
    articleData.data?.id as string,
    {
      enabled: authStatus === "authenticated" && articleData.data?.id !== null,
    }
  );

  // mutation to add a comment
  const commentAddMutation = api.comment.create.useMutation();

  const OnCommentAdd = (comment: AddCommentData) => {
    // TODO: open a modal  for the comment
    commentAddMutation.mutateAsync({
      articleId: articleData.data?.id as string,
      content: comment.content,
      parentId: comment.parent,
    });
    // .then(() => {
    //   commentData.refetch();
    // });
  };

  let userImage = userData?.user?.image;
  if (userImage === null) userImage = "/default_profile.jpg";

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
        <div className="mb-6 mt-8 flex flex-row  justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-6 w-6 text-black" />
              {/* 
              TODO: 
                Loading icon is glithing but good enough for now
                to Reproduce the glitch:
                  1. go to an article
                  2. minimize the window / go to another app
                  3. come back to the article
                  4. the loading icon will glitch
                  - loading will show up then show the vote 
                  - then loading will show up again and then show the vote
                  - this will happen only once


                  !voteRankQuery.isFetching &&
                  !voteAddMutation.isLoading &&
                  voteRankQuery.isSuccess 

                  voteRankQuery.isSuccess this condition is might be removed
              */}

              {!voteRankQuery.isFetching && !voteAddMutation.isLoading ? (
                voteRankQuery.data
              ) : (
                <Loading className="h-6 w-6 border-2" />
              )}
            </div>
            <button
              onClick={() => {
                if (authStatus !== "authenticated") {
                  signIn();
                  return;
                } else {
                  // FIXME: we might consider remove async mutation here
                  voteAddMutation
                    .mutateAsync({
                      articleId: articleData.data?.id as string,
                      vote: "up",
                    })
                    .then(() => {
                      voteRankQuery.refetch();
                      myVoteQuery.refetch();
                    });
                }
              }}
            >
              <ChevronUpIcon
                className={`h-8 w-8 p-1 ${
                  myVoteQuery.data?.voteDirection === "up"
                    ? " rounded-full bg-gray-200 text-indigo-500"
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
                  // FIXME: we might consider remove async mutation here
                  voteAddMutation
                    .mutateAsync({
                      articleId: articleData.data?.id as string,
                      vote: "down",
                    })
                    .then(() => {
                      voteRankQuery.refetch();
                      myVoteQuery.refetch();
                    });
                }
              }}
            >
              <ChevronDownIcon
                className={`h-8 w-8 p-1 ${
                  myVoteQuery.data?.voteDirection === "down"
                    ? "rounded-full bg-gray-200 text-indigo-500"
                    : " text-black"
                }`}
              />
            </button>
          </div>
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
            <p className="font-semibold sm:text-base md:text-lg ">
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

      {/* Comments should have a separate api */}
      {commentData.data?.rootCommentsCount !== 0 && (
        <div className="py-4">
          <p className="text-lg font-semibold">
            <span className="font-medium">
              {commentData.data?.rootCommentsCount + " "}
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
                collapsable={true}
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
              user={{
                id: userData?.user?.id as string,
                name: userData?.user?.name as string,
                image: userImage || "/default_profile.jpg",
              }}
              isAuthed={authStatus == "authenticated"}
              articleId={articleData.data?.id as string}
              slug={slug as string}
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
        <link
          rel="canonical"
          href={`https://${
            getBaseUrl() == "" ? window.location.hostname : getBaseUrl()
          }/articles/${slug}`}
        />
        {/* TODO: Add keywords */}
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
    ctx: createInnerTRPCContext({ session: null, req: null, res: null }),
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug as string;

  // prefetch `article.getBySlug`
  const articleBySlug = helpers.article.getBySlug.prefetch(slug);
  const commentBySlug = helpers.comment.getBySlug.prefetch(slug);

  await Promise.all([articleBySlug, commentBySlug]);

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
