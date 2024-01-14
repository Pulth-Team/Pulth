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

import DashboardLayout from "~/components/layouts";

import DocumentRenderer from "~/components/editor/renderer/DocumentRenderer";
import CommentAlgo from "~/components/editor/CommentAlgo";
import Loading from "~/components/Loading";

import { createServerSideHelpers } from "@trpc/react-query/server";
import { GetStaticPaths, GetStaticPropsContext } from "next";

// import { prisma } from "server/context";
import { appRouter } from "~/server/api/root";

import superjson from "superjson";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { prisma } from "~/server/db";

import { env } from "~/env.mjs";
import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();
import { ReportView } from "~/components/ReportView";

interface ArticleProps {
  viewCount: number;
}

const Articles: NextPage<ArticleProps> = ({ viewCount }) => {
  const router = useRouter();
  const { data: userData, status: authStatus } = useSession();
  const { slug } = router.query;

  // query to get the article data
  const articleData = api.article.getBySlug.useQuery((slug as string) || "", {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });

  const isArticleExists = articleData.data?.id !== undefined;

  //query to get the comment data
  const commentData = api.comment.getCountBySlug.useQuery(slug as string, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });

  // query to get the vote rank
  const voteRankQuery = api.vote.getVoteRankBySlug.useQuery(slug as string, {
    enabled: isArticleExists,
    refetchIntervalInBackground: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const tagQuery = api.tag.getTagsBySlug.useQuery(
    { slug: slug as string },
    {
      enabled: isArticleExists,
      refetchIntervalInBackground: false,
      refetchInterval: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  // query to get my vote automatically
  const myVoteQuery = api.vote.checkMyVoteByArticleId.useQuery(
    articleData.data?.id as string,
    {
      enabled: authStatus === "authenticated" && isArticleExists,
      refetchIntervalInBackground: false,
      refetchInterval: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  // mutation to add a vote
  const voteAddMutation = api.vote.voteByArticleId.useMutation();

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
      {!isArticleExists && (
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

      {/* Show title as a h1  */}
      {
        <h1 className="m-0 mb-2 p-0 text-3xl font-bold">
          {articleData.data?.title || "unnamed"}
        </h1>
      }

      {RenderedDocument}

      {/* Tags */}
      {isArticleExists && tagQuery.isSuccess && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tagQuery.data.map((tagEntry) => (
            <Link
              key={tagEntry.tag.id}
              href={{
                pathname: `/tags/[tagId]`,
                query: { tagId: tagEntry.tag.slug },
              }}
              className="rounded-md border-2 border-indigo-500 border-opacity-70 p-2 text-sm text-indigo-500 hover:bg-indigo-500 hover:bg-opacity-20 "
            >
              {tagEntry.tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* Rank and action buttons */}
      {isArticleExists && (
        <div className="mb-6 mt-8 flex flex-row items-center justify-between md:px-4">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-6 w-6 text-black" />
              {voteAddMutation.isLoading ? (
                <Loading className="h-6 w-6 border-2" />
              ) : (
                voteRankQuery.isSuccess &&
                (voteRankQuery.data instanceof Error ? (
                  <p className="text-black">{voteRankQuery.data.message}</p>
                ) : (
                  <p className="text-black">{voteRankQuery.data}</p>
                ))
              )}
            </div>
            <button
              disabled={voteAddMutation.isLoading}
              onClick={() => {
                if (authStatus !== "authenticated") {
                  signIn();
                  return;
                } else {
                  // return if the mutation is already loading
                  if (voteAddMutation.isLoading) return;
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
              className="group"
              aria-label="Upvote"
              aria-labelledby="article"
            >
              <ChevronUpIcon
                className={`h-8 w-8 rounded-full p-1  ${
                  myVoteQuery.data?.voteDirection === "up"
                    ? " bg-gray-200 text-indigo-500"
                    : " text-black hover:bg-gray-100 group-disabled:bg-white"
                }`}
              />
            </button>
            <button
              disabled={voteAddMutation.isLoading}
              onClick={() => {
                if (authStatus !== "authenticated") {
                  signIn();
                  return;
                } else {
                  // return if the mutation is already loading
                  if (voteAddMutation.isLoading) return;
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
              className="group"
            >
              <ChevronDownIcon
                className={`h-8 w-8 rounded-full p-1 ${
                  myVoteQuery.data?.voteDirection === "down"
                    ? "bg-gray-200 text-indigo-500 "
                    : " text-black hover:bg-gray-100 group-disabled:bg-white"
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
          <span className="ml-auto text-sm text-black/70">
            {viewCount} views
          </span>
        </div>
      )}
      {/* About the author */}
      {isArticleExists && articleData.data?.author && (
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
      {isArticleExists && (
        <div className="py-4">
          <p className="text-lg font-semibold">
            <span className="font-medium">
              {commentData.data?.rootCommentsCount + " "}
            </span>
            Comments
          </p>
          <hr className="mb-2" />

          <CommentAlgo
            articleId={articleData.data?.id as string}
            slug={slug as string}
          />
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
        <ReportView slug={slug as string} />
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

  const views =
    (await redis.get<number>([env.REDIS_GROUP, "pageviews", slug].join(":"))) ??
    0;

  // prefetch `article.getBySlug`
  const articleBySlug = helpers.article.getBySlug.prefetch(slug);

  //prefetch `comment.getCountBySlug`
  const commentCountBySlug = helpers.comment.getCountBySlug.prefetch(slug);

  // prefetch `vote.getVoteRankByArticleId`
  const voteRank = helpers.vote.getVoteRankBySlug.prefetch(slug);

  // prefetch `comment.getBySlug`
  const commentBySlug = helpers.comment.getBySlug.prefetch(slug);

  // prefetch `Tags`
  const tagInfo = helpers.tag.getTagsBySlug.prefetch({ slug });

  // prefetch `vote.checkMyVoteByArticleId`
  const myVote = helpers.vote.checkMyVoteBySlug.prefetch(slug);

  await Promise.all([
    commentCountBySlug,
    articleBySlug,
    commentBySlug,
    tagInfo,
    voteRank,
    myVote,
  ]);

  return {
    props: {
      trpcState: helpers.dehydrate(),
      viewCount: views,
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
