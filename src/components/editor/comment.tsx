import {
  ArrowUturnLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { trpc } from "../../utils/trpc";

import Image from "next/image";

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
  const { data, status } = useSession();
  const user = data?.user;

  const requestedSubComments = 2;
  let shouldShown: boolean = false;

  const [replyShow, setReplyShow] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const router = useRouter();
  const slug = router.query.slug as string;

  const createCommentQuery = trpc.useQuery(
    [
      "article.createComment",
      {
        slug,
        content: replyContent,
        parentId: comment.parentId ?? undefined,
      },
    ],
    {
      enabled: false,
    }
  );

  const handleReply = () => {
    setReplyShow(!replyShow);
    createCommentQuery.refetch();
  };

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
            src={comment.author.image || "/default_profile.jpg"}
            className="w-8 h-8 rounded-full"
          />
        </div>
        <p className="ml-2  font-medium ">{comment.author.name}</p>
        {shouldShown ? (
          <button
            className="ml-auto font-normal text-sm flex gap-x-2 items-center"
            onClick={() => {
              setReplyShow(!replyShow);
            }}
          >
            Reply
            <ArrowUturnLeftIcon className="h-4" />
          </button>
        ) : (
          ""
        )}
        {/* Todo add comment date */}
      </div>
      <p className={` ${replyShow ? "" : " mb-4 "} ml-10`}>{comment.content}</p>
      {replyShow ? (
        <div className="ml-10 mb-4 mt-2 flex items-center gap-x-2">
          <div className="relative w-8 h-8 flex-shrink-0 self-start">
            <Image
              alt="avatar"
              layout="fill"
              src={user?.image || "/default_profile.jpg"}
              className="w-8 h-8 rounded-full"
            />
          </div>
          {status === "unauthenticated" ? (
            <button
              className="w-full  bg-gray-700 flex items-center justify-center py-2 rounded-md"
              onClick={() => signIn()}
            >
              <p className="text-gray-200">Login to reply</p>
            </button>
          ) : (
            <div className="flex flex-col flex-grow">
              <textarea
                className=" border p-1 rounded-md"
                placeholder="Add Comment..."
                onChange={(e) => {
                  setReplyContent(e.target.value);
                }}
              ></textarea>
              <div className="flex gap-x-2 ml-auto my-2">
                <button
                  className="hover:bg-black/10 p-2  rounded-md"
                  onClick={() => {
                    setReplyShow(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-400"
                  onClick={() => {
                    handleReply();
                  }}
                >
                  Comment
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        ""
      )}
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

export default Comment;
