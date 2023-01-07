import type { NextPage } from "next";

import { trpc } from "../../../utils/trpc";
import Head from "next/head";
import { useRouter } from "next/router";

import DashboardLayout from "../../../components/layouts/dashboard";
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
  const calculateDepth = (parentId: string, comment: Comment) => {
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
          calculateDepth(parentComment.parentId!, parentComment);
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
  comments?.forEach((comment) => {
    calculateDepth(comment.parentId!, comment);
  });

  return (
    <>
      {comments ? (
        commentsByParentId["root"]?.comments.map((comment) => (
          <>
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
          </>
        ))
      ) : (
        <p>No comments yet</p>
      )}
    </>
  );
};

interface Comment {
  id: string;
  author: {
    image: string | null;
    name: string | null;
  };
  content: string;
  rating: number;
  parentId: string | null;
}
interface CommentProps {
  comment: Comment;
  subComments: Comment[];
  allComments: Comment[];
  commentsByParentId: {
    [key: string]: {
      comments: Comment[];
      childrenIds: string[];
      depth: number;
    };
  };
  OnClick: (comment: Comment) => void;
}

const Comment = ({
  comment,
  subComments,
  allComments,
  commentsByParentId,
  OnClick,
}: CommentProps) => {
  let shouldShown: boolean = false;
  const requestedSubComments = 2;

  shouldShown =
    !comment.parentId ||
    (commentsByParentId[comment.id] &&
      commentsByParentId[comment.id]?.depth! < requestedSubComments)
      ? true
      : false;

  return (
    <div className="">
      <div className="flex items-center relative">
        {/* Rating count and arrows beside that*/}
        <div className="flex flex-col self-stretch mr-2 items-center absolute -translate-x-8 -translate-y-3">
          <button>
            <ChevronUpIcon className="h-5 self-stretch aspect-square stroke-black/60 hover:stroke-black/100" />
          </button>
          <p className="leading-3 text-sm">{comment.rating} </p>
          <button>
            <ChevronDownIcon className="h-5 self-stretch aspect-square stroke-black/60 hover:stroke-black/100" />
          </button>
        </div>
        <div className="relative w-8 h-8">
          <Image
            alt="avatar"
            layout="fill"
            src={comment.author.image || "/images/default-avatar.png"}
            className="w-8 h-8 rounded-full"
          />
        </div>
        <p className="ml-2  font-medium ">{comment.author.name}</p>
        {shouldShown ? (
          <button
            className="ml-auto font-normal text-sm flex gap-x-2 items-center"
            onClick={() => OnClick(comment)}
          >
            Reply
            <ArrowUturnLeftIcon className="h-4" />
          </button>
        ) : (
          ""
        )}
        {/* Todo add comment date */}
      </div>
      <p className="ml-10 mb-4 ">{comment.content}</p>

      {/* <div className="flex items-start mb-2">
        <div className="relative w-8 h-8">
          <Image
            alt="avatar"
            layout="fill"
            src={comment.author.image || "/images/default-avatar.png"}
            className="w-8 h-8 rounded-full"
          />
        </div>
        <p className="ml-2  font-semibold ">{comment.author.name}</p>
        <button
          className="ml-auto font-medium text-base flex gap-x-2"
          onClick={() => OnClick(comment)}
        >
          Reply
          <ArrowUturnLeftIcon className="w-6 h-6" />
        </button>
      </div>
      <hr className="ml-10" />
      <p className="ml-10">{comment.content}</p> */}

      <div className="ml-10">
        {shouldShown
          ? subComments?.map((comment) => (
              <Comment
                comment={comment}
                allComments={allComments}
                commentsByParentId={commentsByParentId}
                subComments={
                  commentsByParentId && commentsByParentId[comment.id]
                    ? allComments.filter((childComment) =>
                        commentsByParentId[comment.id]!.childrenIds.includes(
                          childComment.id
                        )
                      )
                    : []
                }
                OnClick={OnClick}
                key={comment.id}
              />
            ))
          : null}
      </div>
    </div>
  );
};
