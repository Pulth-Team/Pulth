import type { NextPage } from "next";

import { trpc } from "../../../utils/trpc";
import Head from "next/head";
import { useRouter } from "next/router";

import DashboardLayout from "../../../components/layouts/dashboard";
import Comment from "../../../components/editor/comment";

import {
  ArrowUturnLeftIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowUturnRightIcon,
} from "@heroicons/react/24/outline";

import DocumentRenderer, {
  OutputBlockType,
} from "../../../components/editor/renderer/DocumentRenderer";
import Image from "next/image";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";

// TODO: fix this component
// bad parts:
// - the not supporting SSG
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
  const OnClick = (comment: Comment) => {
    // todo open a modal  for the comment
    console.log(comment);
  };

  let body = (
    <>
      <DocumentRenderer blocks={blocks} />
      <div className="py-4 ">
        <p className="text-lg font-semibold">Comments</p>
        <hr />
        <br />
        <div className="flex flex-col ">
          <CommentList
            comments={articleData.data?.Comments}
            OnClick={OnClick}
          />
        </div>
      </div>
    </>
  );
  return (
    <DashboardLayout>
      <Head>
        <title>{articleData.data?.title || "unnamed"} - Pulth App</title>
        <meta name="description" content={articleData.data?.description} />
        <meta name="author" content={articleData.data?.author?.name!} />
        <meta name="generator" content="Pulth Engine" />
        <link rel="icon" href="/favicon.ico" />
        {/* Add keywords */}
      </Head>
      {/* read article container for our article renderer with media queries */}
      <div className="p-4 container max-w-2xl mx-auto">
        {articleData.data?.error ? <p>{articleData.data.error}</p> : body}
        {/* Add Comments, Tags, AuthorBox, Action Button */}
      </div>
    </DashboardLayout>
  );
};

export default Articles;

const CommentList = ({
  comments,
  OnClick,
}: {
  comments?: Comment[];
  OnClick: (comment: Comment) => void;
}) => {
  // group comments by parentId in a object because of recursive comments
  // if parentId is null, then it is a top level comment
  // if parentId is not null, then it is a sub comment
  const commentsByParentId: {
    [key: string]: {
      comments: Comment[];
      childrenIds: string[];
      depth: number;
    };
  } = {};

  comments?.forEach((comment) => {
    // if comment has a parentId, then it is a sub comment
    if (comment.parentId) {
      // if the parentId is already in the object, then add the comment to the array
      if (commentsByParentId[comment.parentId]) {
        // add the comment to the array
        commentsByParentId[comment.parentId]!.comments.push(comment);
        commentsByParentId[comment.parentId]!.childrenIds.push(comment.id);
      } else {
        // if the parentId is not in the object, then create a new object
        commentsByParentId[comment.parentId] = {
          comments: [comment],
          childrenIds: [comment.id],
          depth: -1,
        };
      }
    } else {
      if (commentsByParentId["root"]) {
        commentsByParentId["root"].comments.push(comment);
        commentsByParentId["root"].childrenIds.push(comment.id);
      } else {
        commentsByParentId["root"] = {
          comments: [comment],
          childrenIds: [comment.id],
          depth: 0,
        };
      }
    }
  });

  // calculates depth of a comment recursively by checking the depth of the parent

  comments?.forEach((comment) => {
    calculateDepth(comment.parentId!, comment, comments!, commentsByParentId);
  });

  return (
    <>
      {comments ? (
        commentsByParentId["root"]?.comments.map((comment) => (
          <Comment
            comment={comment}
            subComments={
              commentsByParentId[comment.id]
                ? comments.filter((childComment) =>
                    commentsByParentId[comment.id]!.childrenIds.includes(
                      childComment.id
                    )
                  )
                : []
            }
            allComments={comments}
            commentsByParentId={commentsByParentId}
            OnClick={OnClick}
            key={comment.id}
          />
        ))
      ) : (
        <p>No comments yet</p>
      )}
    </>
  );
};

// comment form

const calculateDepth = (
  parentId: string,
  comment: Comment,
  comments: Comment[],
  commentsByParentId: {
    [key: string]: {
      comments: Comment[];
      childrenIds: string[];
      depth: number;
    };
  }
) => {
  if (typeof commentsByParentId[comment.id] === "undefined") return;

  // if the parentId is not null, then it is a sub comment
  if (parentId) {
    // if the parentid is not null, then it is a sub comment
    // if the depth of the parent is not calculated, then calculate it
    if (commentsByParentId[parentId]!.depth === -1) {
      // get the parent comment
      const parentComment = comments?.find(
        (comment) => comment.id === parentId
      );
      // if the parent comment is not null, then calculate the depth
      if (parentComment) {
        calculateDepth(
          parentComment.parentId!,
          parentComment,
          comments,
          commentsByParentId
        );
      }
    }
    // if the depth of the parent is calculated, then calculate the depth of the comment
    commentsByParentId[comment.id]!.depth =
      commentsByParentId[parentId]!.depth + 1;
  } else {
    // if the parentId is null, then it is a top level comment
    commentsByParentId[comment.id]!.depth = 0;
  }
};
