import { NextPage } from "next";
import Image from "next/legacy/image";
import {
  ArrowUturnLeftIcon,
  TrashIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { createContext, useContext, useEffect, useState } from "react";
import CommentAdd from "./addComment";
import { api } from "~/utils/api";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { Dialog } from "@headlessui/react";
import Loading from "../Loading";

import { structureComments } from "~/utils/commentHelpers";
import type { CommentData, CommentNode } from "~/utils/commentHelpers";

type ActivitySettings =
  | {
      isActive: true;
      id: string;
      activity: "edit" | "reply";
    }
  | {
      isActive: false;
    };

const CommentContext = createContext<{
  isActive: boolean;
  activity: "edit" | "reply" | "none";
  setActivity: (obj: ActivitySettings) => void;
  currentActiveCommentId?: string;

  isAuthed: boolean;
  user: {
    id: string;
    name: string;
    image: string;
  };
  articleId: string;
  requestDelete: (id: string) => void;
}>({
  isActive: false,
  activity: "none",
  setActivity: () => {},
  currentActiveCommentId: undefined,

  isAuthed: false,
  user: {
    id: "",
    name: "",
    image: "",
  },
  articleId: "",
  requestDelete: () => {},
});
CommentContext.displayName = "Comment Context";

const CommentAlgo: NextPage<{
  user: {
    id: string;
    name: string;
    image: string;
  };
  articleId: string;
  isAuthed: boolean;
  slug: string;
}> = ({ user, articleId, isAuthed, slug }) => {
  const commentQuery = api.comment.getBySlug.useQuery(slug);
  const [isDeleteRequested, setIsDeleteRequested] = useState(false);
  const [isRevalidating, setIsRevalidating] = useState(false);

  const [deleteCommentId, setDeleteCommentId] = useState<string>("");

  const deleteCommentMutation = api.comment.delete.useMutation();
  const structuredComment = structureComments(
    (
      commentQuery.data as
        | { comments: CommentData[]; rootCommentsCount: number }
        | undefined
    )?.comments || []
  );

  // closes the dialog when the comment is deleted and revalidates the comments
  useEffect(() => {
    if (deleteCommentMutation.isSuccess) {
      // revalidate the comments
      commentQuery.refetch();
      setIsRevalidating(true);

      setDeleteCommentId("");
    }
  }, [deleteCommentMutation.isSuccess, commentQuery]);

  //useEffect for commentQuery on success
  useEffect(() => {
    if (
      deleteCommentMutation.isSuccess &&
      !commentQuery.isFetching &&
      isRevalidating
    ) {
      deleteCommentMutation.reset();
      setIsRevalidating(false);
      setIsDeleteRequested(false);
      setDeleteCommentId("");
    }
  }, [
    commentQuery.isSuccess,
    commentQuery.isFetching,
    deleteCommentMutation,
    isRevalidating,
  ]);

  const [activity, setActivity] = useState<"edit" | "reply" | "none">("none");
  const [currentActiveCommentId, setCurrentActiveCommentId] = useState<
    string | undefined
  >(undefined);

  return (
    <div className="flex flex-col gap-2">
      <CommentContext.Provider
        value={{
          isActive: activity !== "none",
          activity,
          currentActiveCommentId,
          setActivity: (obj: ActivitySettings) => {
            if (!obj.isActive) {
              setCurrentActiveCommentId(undefined);
              setActivity("none");
              return;
            }

            const { id, activity } = obj;

            setCurrentActiveCommentId(id);
            setActivity(activity);
          },
          isAuthed,
          user,
          articleId,
          requestDelete: (id: string) => {
            setDeleteCommentId(id);
            setIsDeleteRequested(true);
          },
        }}
      >
        {structuredComment.rootComments.map((comment) => {
          return (
            <Comment
              comment={comment}
              key={comment.id}
              isEditedBefore={comment.isEdited}
              revalidate={commentQuery.refetch}
              depth={0}
            />
          );
        })}
      </CommentContext.Provider>

      <Dialog
        open={isDeleteRequested}
        onClose={() => setIsDeleteRequested(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-xl bg-white p-4">
            <Dialog.Title className={"my-2 text-lg font-medium"}>
              Delete Comment
            </Dialog.Title>
            <Dialog.Description>
              Are you sure you want to delete this comment?
            </Dialog.Description>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-md bg-gray-200 p-2 hover:bg-gray-300 active:bg-gray-400"
                onClick={() => {
                  setIsDeleteRequested(false);
                }}
              >
                Cancel
              </button>
              <button
                className="flex items-center gap-2 rounded-md bg-red-500 p-2 text-white hover:bg-red-400 active:bg-red-600"
                onClick={() => {
                  if (deleteCommentId) {
                    deleteCommentMutation.mutateAsync({
                      id: deleteCommentId,
                    });
                  } else
                    console.error(
                      "Delete comment id is null, this should not happen"
                    );
                }}
              >
                {deleteCommentMutation.isLoading || commentQuery.isFetching ? (
                  <Loading className="h-5 w-5 border-2" />
                ) : (
                  <TrashIcon className="h-5 w-5" />
                )}
                Delete
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};
const Comment: NextPage<{
  comment: CommentNode;
  isEditedBefore: boolean;
  depth: number;
  revalidate: () => void;
}> = ({ comment, isEditedBefore, depth, revalidate }) => {
  const {
    isActive,
    activity,
    setActivity,
    currentActiveCommentId,
    articleId,
    isAuthed,
    requestDelete,
    user,
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
    if (editCommentMutation.isSuccess) {
      // reset mutation state
      editCommentMutation.reset();

      // set isEditing to false and update comment content
      setActivity({ isActive: false });
      comment.content = editValue;

      // revalidate the comments
      revalidate();
    }
  }, [editCommentMutation, editValue, comment, revalidate, setActivity]);

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
              {editCommentMutation.isLoading && (
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
                    // set it to not doing anything
                    setActivity({ isActive: false });
                    revalidate();
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
              revalidate={revalidate}
              depth={depth + 1}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CommentAlgo;
