import {
  ArrowUturnLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

import Image from "next/image";
import CommentAdd, { AddCommentData } from "./addComment";
import { api } from "~/utils/api";

interface CommentData {
  // id of the comment
  id: string;
  // id of the parent comment
  // null if this is a top level comment
  parentId: string | null;

  // author's data of the comment
  author: {
    id: string;
    image: string | null;
    name: string | null;
  };

  // content of the comment
  content: string;
  // rating of the comment
  rating: number;

  // sub comments of this comment
  // null if this comment has no sub comments
  subComments?: CommentData[];
}

//
//  WARNING: Currently the "rating" of the comment is not implemented
//           and is always 0. This is because the rating system is not implemented yet.
//            so beacuse of this the "rating" is not shown in the UI.
//
const Comment = ({
  comment,
  currentUser,
  currentArticleId,
  commentDepth,
  OnAnyEdit,
}: {
  // comment is the data of the comment
  comment: CommentData;
  // How nested this comment is
  // this is used to prevent to much nesting.
  // this is automatically calculated while rendering the comments recursively
  commentDepth: number;

  // currentUser is the data of the current user
  // used to check if the current user is the author of the comment
  currentUser: { id: string; name: string; image: string };

  // used to create a new comment in a mutation
  currentArticleId: string;

  // OnAnyEdit is a callback function that is called when this comment or its children are edited
  OnAnyEdit: () => void;
}) => {
  const [showReply, setShowReply] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [showEdit, setShowEdit] = useState(false);

  const commentAddMutation = api.comment.create.useMutation();
  const commentUpdateMutation = api.comment.update.useMutation();
  const commentDeleteMutation = api.comment.delete.useMutation();

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative h-8 w-8 flex-shrink-0">
          <Image
            alt="avatar"
            layout="fill"
            src={comment.author.image || "/default_profile.jpg"}
            className="h-8 w-8 rounded-full"
          />
        </div>
        <div className={`${showEdit ? "w-full" : "mr-auto"} `}>
          <p className="font-semibold leading-5">{comment.author.name}</p>
          {showEdit ? (
            <>
              <textarea
                className="w-full resize-none overflow-y-hidden rounded-md border-2 border-gray-200 bg-[#fafafa] px-2 py-1 outline-gray-300"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={async () => {
                    // TODO: Add edit comment mutation
                    await commentUpdateMutation.mutate({
                      id: comment.id,
                      content: editValue,
                    });
                    OnAnyEdit();
                    setShowEdit(!showEdit);
                  }}
                  className="flex items-center gap-2 rounded-md bg-indigo-500 p-2 text-white hover:bg-indigo-400 active:bg-indigo-600 disabled:bg-indigo-400"
                  disabled={editValue === "" || editValue === comment.content}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditValue(comment.content);
                    setShowEdit(!showEdit);
                  }}
                  className="rounded-md bg-gray-200 p-2 hover:bg-gray-300 active:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <p className="">{comment.content}</p>
          )}
        </div>
        {currentUser.id === comment.author.id ? (
          <>
            <button
              onClick={() => {
                setEditValue(comment.content);
                setShowEdit(!showEdit);
              }}
            >
              <PencilSquareIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                commentDeleteMutation.mutate({ id: comment.id });
              }}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </>
        ) : (
          commentDepth < 3 && (
            <button
              onClick={() => {
                if (commentDepth < 3) setShowReply(!showReply);
              }}
            >
              <ArrowUturnLeftIcon className="h-5 w-5" />
            </button>
          )
        )}
      </div>
      <div className="mt-2 pl-10 ">
        {/* if showReply is true (if we clicked to reply button) show the comment add Comp. */}
        {showReply ? (
          <CommentAdd
            className=""
            parentId={comment.id}
            user={{ name: currentUser.name, image: currentUser.image }}
            isLoading={false}
            OnComment={(e: AddCommentData) => {
              commentAddMutation.mutate(
                {
                  content: e.content,
                  parentId: e.parent,
                  articleId: currentArticleId,
                },
                {
                  onSuccess: () => {
                    setShowReply(false);
                  },
                  onError(error, variables, context) {
                    // TODO: check isSuccess and show error if not
                    console.log("Error while adding a new comment: ", {
                      error,
                      variables,
                      context,
                    });
                  },
                }
              );
            }}
            OnCancel={() => {
              setShowReply(false);
            }}
          />
        ) : (
          ""
        )}
        {comment.subComments?.map((subComment) => {
          return (
            <Comment
              key={subComment.id}
              currentUser={currentUser}
              comment={subComment}
              currentArticleId={currentArticleId}
              commentDepth={commentDepth + 1}
              OnAnyEdit={OnAnyEdit}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Comment;
export type { CommentData };
