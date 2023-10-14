import { NextPage } from "next";

import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";

import { TrashIcon } from "@heroicons/react/24/outline";

import { api } from "~/utils/api";
import { structureComments } from "~/utils/commentHelpers";

import CommentContext, { ActivitySettings } from "../contexts/Comment";

import Loading from "../Loading";
import Comment from "./Comment";

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
  const [revalidationState, setRevalidationState] = useState<
    "idle" | "delete" | "edit" | "reply"
  >("idle");

  const [deleteCommentId, setDeleteCommentId] = useState<string>("");

  const deleteCommentMutation = api.comment.delete.useMutation();
  const structuredComment = structureComments(
    commentQuery.data?.comments || []
  );

  // closes the dialog when the comment is deleted and revalidates the comments
  useEffect(() => {
    if (deleteCommentMutation.isSuccess) {
      // revalidate the comments
      setRevalidationState("delete");
      commentQuery.refetch();

      setDeleteCommentId("");
    }
  }, [deleteCommentMutation.isSuccess, commentQuery]);

  //useEffect for deleteComment on success
  useEffect(() => {
    // only use this effect when you are doing something
    // revalidationState is delete
    if (
      deleteCommentMutation.isSuccess &&
      // for some reason, the we cannot use isFetched here
      // TODO: find out why
      !commentQuery.isFetching &&
      revalidationState === "delete"
    ) {
      deleteCommentMutation.reset();
      setRevalidationState("idle");
      // close the dialog
      setIsDeleteRequested(false);
      // resets the delete comment id to empty string
      // so that the dialog doesnt open again when the comment is deleted
      setDeleteCommentId("");
    }
  }, [commentQuery.isFetching, deleteCommentMutation, revalidationState]);

  // useEffect for revalidation on success
  useEffect(() => {
    // only use this effect when you are doing something
    // revalidationState is not delete
    if (
      // for some reason, the we cannot use isFetched here
      !commentQuery.isFetching &&
      // we are checing revaidationState here because
      // delete logic is handled in the above useEffect
      ["reply", "edit"].includes(revalidationState)
    ) {
      // reset the revalidation state
      // so we can identify the next revalidation
      setRevalidationState("idle");
      // reset the context state
      setActivity("none");
      setCurrentActiveCommentId(undefined);
    }
  }, [commentQuery.isFetching, revalidationState]);

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
          isAuthed,
          user,
          articleId,
          revalidationStatus: (() => {
            if (!commentQuery.isFetching) return "success";
            if (commentQuery.isFetching) return "loading";
            if (commentQuery.isError) return "error";
            return "idle";
          })(),
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
          requestDelete: (id: string) => {
            setDeleteCommentId(id);
            setIsDeleteRequested(true);
          },
          revalidate: (reason: "edit" | "reply") => {
            setRevalidationState(reason);
            commentQuery.refetch();
          },
        }}
      >
        {structuredComment.rootComments.map((comment) => {
          return (
            <Comment
              comment={comment}
              key={comment.id}
              isEditedBefore={comment.isEdited}
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
                    deleteCommentMutation.mutate({
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

export default CommentAlgo;
