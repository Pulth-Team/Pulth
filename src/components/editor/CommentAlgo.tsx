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
  const [isRevalidating, setIsRevalidating] = useState(false);

  const [deleteCommentId, setDeleteCommentId] = useState<string>("");

  const deleteCommentMutation = api.comment.delete.useMutation();
  const structuredComment = structureComments(
    commentQuery.data?.comments || []
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

export default CommentAlgo;
