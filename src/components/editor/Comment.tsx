import { NextPage } from "next/types";
import Image from "next/image";
import Link from "next/link";

import { useContext, useEffect, useState } from "react";
import { signIn } from "next-auth/react";

import { api } from "~/utils/api";
import CommentContext from "../contexts/Comment";

import { CommentNode } from "~/utils/commentHelpers";
import { twMerge } from "tailwind-merge";

import Loading from "../Loading";
import CommentAdd from "./addComment";

import {
  ArrowUturnLeftIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const Comment: NextPage<{
  comment: CommentNode;
  isEditedBefore: boolean;
  depth: number;
}> = ({ comment, isEditedBefore, depth }) => {
  const {
    activity,
    setActivity,
    currentActiveCommentId,
    articleId,
    isAuthed,
    requestDelete,
    user,
    revalidate,
    revalidationStatus,
  } = useContext(CommentContext);
  const [editValue, setEditValue] = useState(comment.content);

  const addCommentMutation = api.comment.create.useMutation();
  const editCommentMutation = api.comment.update.useMutation();

  const isItThisComment = currentActiveCommentId === comment.id;
  const isEditing = isItThisComment && activity === "edit";
  const isReplying = isItThisComment && activity === "reply";

  const amITheAuthor = comment.author.id === user.id;

  useEffect(() => {
    // doesnt look smooth
    if (editCommentMutation.isSuccess && isEditing) {
      // reset mutation state
      editCommentMutation.reset();
      comment.content = editValue;

      // revalidate the comments
      // revalidation will be done in CommentAlgo
      // when revaidation is done, it will set revalidationStatus to "idle"
      // and we will set activity to "idle" in CommentAlgo
      // and it will set currentActiveCommentId to ""
      revalidate("edit");
    }
  }, [comment, editCommentMutation, editValue, isEditing, revalidate]);

  return (
    <div className="">
      <div className="flex gap-2">
        <div className="flex flex-col justify-between">
          <div className="relative h-8 w-8 flex-shrink-0 flex-grow-0 ">
            <Image
              src={comment.author.image || "/default_profile.jpg"}
              alt={comment.author.image + " profile image"}
              layout="fill"
              className="absolute rounded-full"
            ></Image>
          </div>
          <div
            className={twMerge(
              "ml-3 flex w-min flex-grow bg-cyan-300",
              !isEditing && "mt-2",

              (isEditing || comment.children.length > 0) && "border-l-4"
            )}
          ></div>
        </div>
        <div className="flex-grow">
          <Link
            href={{
              pathname: "/user/[userId]",
              query: { userId: comment.author.id },
            }}
            className="pr-2 font-semibold leading-5 hover:underline"
          >
            {comment.author.name}
          </Link>
          <span className="font-normal text-black/70">
            {isEditedBefore ? "edited" : ""}
          </span>

          {!isEditing && <p className="break-all">{comment.content}</p>}
        </div>
        <div className="flex flex-shrink-0 flex-row">
          {/* TODO: We dont show reply button but backend can handle more replies so this filter also should be added to backend */}
          {depth < 3 && (
            <ArrowUturnLeftIcon
              className="h-5 w-5 text-black/70 hover:text-black"
              onClick={() => {
                if (isAuthed)
                  if (isReplying) setActivity({ isActive: false });
                  else
                    setActivity({
                      isActive: true,
                      id: comment.id,
                      activity: "reply",
                    });
                else signIn();
              }}
            />
          )}
          {amITheAuthor && (
            <PencilSquareIcon
              className="h-5 w-5 text-black/70 hover:text-black"
              onClick={() => {
                // If its already editing, then cancel editing
                if (isEditing) setActivity({ isActive: false });
                // else set it to editing
                else
                  setActivity({
                    isActive: true,
                    id: comment.id,
                    activity: "edit",
                  });
              }}
            />
          )}

          {amITheAuthor && (
            <TrashIcon
              className="h-5 w-5 text-black/70 hover:text-black"
              onClick={() => {
                // send delete request ro parent CommentAlgo component
                requestDelete(comment.id);
              }}
            />
          )}
        </div>
      </div>
      {isEditing && (
        <>
          <div className="ml-3 mt-2 flex border-l-4 pb-2 pl-7">
            {/* will height change when present */}
            <textarea
              onChange={(e) => {
                setEditValue(e.target.value);
                // will grow and shrink with the content with minimum high of 2 lines
                let maxValue = 56;
                let currentHeight = e.target.scrollHeight;

                // assign currentHeight to maxValue if its bigger
                if (currentHeight > maxValue) maxValue = currentHeight;

                e.target.style.height = maxValue + "px";
              }}
              onFocus={(e) => {
                // will grow and shrink with the content
                let maxValue = 56;
                let currentHeight = e.target.scrollHeight;

                console.log({ currentHeight, maxValue });
                // assign currentHeight to maxValue if its bigger
                if (currentHeight > maxValue) maxValue = currentHeight;

                e.target.style.height = maxValue + "px";
              }}
              defaultValue={isEditing ? comment.content : ""}
              maxLength={255}
              minLength={1}
              className="flex-grow resize-none overflow-y-hidden rounded-md border-2 border-gray-200 bg-[#fafafa] p-1 outline-gray-300"
            ></textarea>
          </div>
          <div className="ml-3 flex justify-end gap-2 border-l-4">
            <p className="text-sm text-gray-500">{editValue.length}/255</p>
            <button
              className="flex items-center gap-2 rounded-md bg-indigo-500 p-2 text-white hover:bg-indigo-400 active:bg-indigo-600 disabled:bg-indigo-400"
              onClick={() => {
                editCommentMutation.mutate({
                  id: comment.id,
                  content: editValue,
                });
              }}
              disabled={
                editValue === comment.content ||
                editValue === "" ||
                editCommentMutation.isLoading
              }
            >
              {(editCommentMutation.isLoading ||
                revalidationStatus === "loading") && (
                <Loading className="h-5 w-5 border-2" />
              )}
              Update
            </button>
            <button
              className="rounded-md bg-gray-200 p-2 hover:bg-gray-300 active:bg-gray-400"
              onClick={() => {
                // set it to not doing anything
                setActivity({ isActive: false });
                setEditValue(comment.content);
              }}
            >
              Cancel
            </button>
          </div>
        </>
      )}

      <div
        className={twMerge(
          "ml-3 flex flex-col gap-2 pl-3 md:pl-6",
          (comment.children.length > 0 || isReplying) && "border-l-4 pt-4"
        )}
      >
        {isReplying && isAuthed && (
          <CommentAdd
            user={{
              name: user.name as string,
              image: user.image || "/default_profile.jpg",
            }}
            OnComment={({ content }) => {
              addCommentMutation.mutate(
                {
                  content,
                  parentId: comment.id,
                  articleId,
                },
                {
                  onSuccess: () => {
                    revalidate("reply");
                  },
                }
              );
            }}
            collapsable={false}
            OnCancel={() => {
              // set it to not doing anything
              setActivity({ isActive: false });
            }}
            isLoading={addCommentMutation.isLoading}
          />
        )}

        {comment.children.map((child) => {
          return (
            <Comment
              comment={child}
              key={child.id}
              isEditedBefore={child.isEdited}
              depth={depth + 1}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Comment;
