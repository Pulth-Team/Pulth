import type { NextPage } from "next";

import { api } from "~/utils/api";
import Head from "next/head";
import { useRouter } from "next/router";

import DashboardLayout from "~/components/layouts/gridDashboard";
import Comment, { CommentData } from "~/components/editor/comment";
import CommentAdd, { AddCommentData } from "~/components/editor/addComment";

import DocumentRenderer, {
  OutputBlockType,
} from "~/components/editor/renderer/DocumentRenderer";
import { signIn, useSession } from "next-auth/react";
import { useMemo } from "react";
import CommentAlgo from "~/components/editor/CommentAlgo";

// TODO: Add support for SSG
// TODO: Add support for Loading State in CSR
const Articles: NextPage = () => {
  const router = useRouter();
  const { data: userData, status } = useSession();
  const { slug } = router.query;

  // query to get the article data
  const articleData = api.article.getBySlug.useQuery((slug as string) || "");

  // mutation to add a comment
  const commentAddMutation = api.comment.create.useMutation();

  let blocks: OutputBlockType[] = [];
  if (articleData.data?.bodyData) {
    blocks = articleData.data.bodyData as unknown as OutputBlockType[];
  }

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
    () => <DocumentRenderer blocks={blocks} />,
    [blocks]
  );

  let body = (
    <>
      {RenderedDocument}
      <div className="py-4 ">
        <p className="text-lg font-semibold">
          <span className="font-medium">
            {articleData.data?.Comments?.length + " "}
          </span>
          Comments
        </p>
        <hr className="mb-2" />
        <div className="flex flex-col ">
          {status == "authenticated" ? (
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
            isAuthed={status == "authenticated"}
            articleId={articleData.data?.id as string}
            revalidate={articleData.refetch}
          />
        </div>
      </div>
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
