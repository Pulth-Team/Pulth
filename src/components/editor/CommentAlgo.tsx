import { NextPage } from "next";
import Image from "next/legacy/image";
import {
  ArrowUturnLeftIcon,
  TrashIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import CommentAdd from "./addComment";
import { api } from "~/utils/api";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { Dialog } from "@headlessui/react";
import Loading from "../Loading";

interface Comment {
  id: string;
  content: string;
  isEdited: boolean;
  parentIds: string[];
  author: {
    id: string | null;
    name: string | null;
    image: string | null;
  };
}

class CommentNode {
  id: string = "";
  content: string = "";
  isEdited: boolean = false;
  parentIds: string[] = [];
  fullfilled: boolean = false;
  author: {
    id: string | null;
    name: string | null;
    image: string | null;
  } = {
    id: null,
    name: null,
    image: null,
  };
  children: CommentNode[] = [];

  public static fromComment(comment: Comment) {
    const node = new CommentNode();
    node.author = comment.author;
    node.content = comment.content;
    node.id = comment.id;
    node.parentIds = comment.parentIds;
    node.children = [];
    node.fullfilled = true;
    node.isEdited = comment.isEdited;
    return node;
  }

  public static fromDummy(id: string, parentIds: string[]) {
    const node = new CommentNode();
    node.author = {
      id: null,
      name: null,
      image: null,
    };
    node.content = "";
    node.id = id;
    node.parentIds = parentIds;
    node.children = [];
    node.fullfilled = false;
    return node;
  }

  addChild(child: CommentNode) {
    this.children.push(child);
  }

  checkAndGetChild(id: string) {
    const child = this.children.filter((child) => child.id === id);
    if (child.length === 0) return null;
    else if (child.length == 1) return child[0];
    else throw new Error("More than one child found, more than 1 id match");
  }
  checkAndGetPath(
    pathArray: string[]
  ): CommentNode | { failed: true; path: string[] } {
    if (pathArray.length > 0 && pathArray[0]) {
      const child = this.checkAndGetChild(pathArray[0]);
      if (child) {
        return child.checkAndGetPath(pathArray.slice(1));
      } else {
        return { failed: true, path: pathArray };
      }
    }
    return this;
  }
}

// Node based comment tree
class CommentTree {
  rootComments: CommentNode[];

  constructor() {
    this.rootComments = [];
  }

  getPath(pathArray: string[]) {
    return this.rootComments.find((rootComment) => {
      if (rootComment.id === pathArray[0]) {
        return rootComment.checkAndGetPath(pathArray.slice(1));
      }
    });
  }

  addComment(comment: Comment) {
    // check if the parentId exists
    // if it does, add the comment to the last node
    // if it doesn't, create the path and add the comment to the last node

    // parentIds is empty, add to root
    if (comment.parentIds.length === 0) {
      this.rootComments.push(CommentNode.fromComment(comment));
    }
    // parentIds is not empty, add to parent's children
    else {
      // get first parent it should be in the root comments
      const rootParent = this.rootComments.filter((rootComment) => {
        return rootComment.id === comment.parentIds[0];
      });
      // if there is no root parent, return false
      if (rootParent.length === 0) {
        throw new Error("No root parent found");

        // if there is more than one root parent, throw error
      } else if (rootParent.length > 1) {
        throw new Error(
          "More than one root parent found, more than 1 id match"
        );

        // if there is one root parent, check if the path exists
      } else if (rootParent.length == 1 && rootParent[0]) {
        const pathExists = rootParent[0].checkAndGetPath(
          comment.parentIds.slice(1)
        );

        if (pathExists instanceof CommentNode) {
          // console.log(
          //   "path exists",
          //   { content: pathExists.content, id: pathExists.id },
          //   {
          //     content: comment.content,
          //     id: comment.id,
          //     given: comment.parentIds.slice(1),
          //   }
          // );

          pathExists.addChild(CommentNode.fromComment(comment));
        } else {
          console.log("path doesn't exist", pathExists);
        }
      }
    }
  }
}

const structureComments = (comments: Comment[]) => {
  const commentTree = new CommentTree();

  comments.forEach((comment) => {
    commentTree.addComment(comment);
  });

  return commentTree;
};

const CommentAlgo: NextPage<{
  comments: Comment[];
  user: {
    id: string;
    name: string;
    image: string;
  };
  articleId: string;
  isAuthed: boolean;
  revalidate: () => void;
}> = ({ comments, user, articleId, revalidate, isAuthed }) => {
  const structuredComment = structureComments(comments);

  return (
    <div className="flex flex-col gap-2">
      {structuredComment.rootComments.map((comment) => {
        return (
          <Comment
            comment={comment}
            key={comment.id}
            user={user}
            articleId={articleId}
            isEdited={comment.isEdited}
            isAuthed={isAuthed}
            revalidate={revalidate}
            depth={0}
          />
        );
      })}
    </div>
  );
};

const Comment: NextPage<{
  comment: CommentNode;
  user: {
    id: string;
    name: string;
    image: string;
  };
  articleId: string;
  isAuthed: boolean;
  isEdited: boolean;
  depth: number;
  revalidate: () => void;
}> = ({ comment, user, articleId, revalidate, isAuthed, isEdited, depth }) => {
  const [reply, setReply] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.content);
  const [deleteModal, setDeleteModal] = useState(false);

  const addCommentMutation = api.comment.create.useMutation();
  const editCommentMutation = api.comment.update.useMutation();
  const deleteCommentMutation = api.comment.delete.useMutation();

  const amITheAuthor = comment.author.id === user.id;
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
            {isEdited ? "edited" : ""}
          </span>

          {!isEditing && <p className="break-all">{comment.content}</p>}
        </div>
        <div className="flex flex-shrink-0 flex-row">
          {/* TODO: We dont show reply button but backend can handle more replies so this filter also should be added to backend */}
          {depth < 3 && (
            <ArrowUturnLeftIcon
              className="h-5 w-5 text-black/70 hover:text-black"
              onClick={() => {
                if (isAuthed) setReply(!reply);
                else signIn();
              }}
            />
          )}
          {amITheAuthor && (
            <PencilSquareIcon
              className="h-5 w-5 text-black/70 hover:text-black"
              onClick={() => {
                setIsEditing(!isEditing);
              }}
            />
          )}

          {amITheAuthor && (
            <TrashIcon
              className="h-5 w-5 text-black/70 hover:text-black"
              onClick={() => {
                setDeleteModal(true);
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
                editCommentMutation.mutate(
                  {
                    id: comment.id,
                    content: editValue,
                  },
                  {
                    onSuccess: () => {
                      setIsEditing(false);
                      comment.content = editValue;
                      revalidate();
                    },
                  }
                );
              }}
              disabled={editValue === comment.content || editValue === ""}
            >
              Update
            </button>
            <button
              className="rounded-md bg-gray-200 p-2 hover:bg-gray-300 active:bg-gray-400"
              onClick={() => {
                setIsEditing(false);
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
          (comment.children.length > 0 || reply) && "border-l-4 pt-4"
        )}
      >
        {reply && isAuthed && (
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
                    setReply(false);
                    revalidate();
                  },
                }
              );
            }}
            collapsable={false}
            OnCancel={() => {
              setReply(false);
            }}
            isLoading={addCommentMutation.isLoading}
          />
        )}

        {comment.children.map((child) => {
          return (
            <Comment
              comment={child}
              key={child.id}
              user={user}
              articleId={articleId}
              isEdited={child.isEdited}
              isAuthed={isAuthed}
              revalidate={revalidate}
              depth={depth + 1}
            />
          );
        })}
      </div>

      <Dialog
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
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
                  setDeleteModal(false);
                }}
              >
                Cancel
              </button>
              <button
                className="flex items-center gap-2 rounded-md bg-red-500 p-2 text-white hover:bg-red-400 active:bg-red-600"
                onClick={() => {
                  deleteCommentMutation.mutate(
                    { id: comment.id },
                    {
                      onSuccess: () => {
                        setDeleteModal(false);
                        revalidate();
                      },
                    }
                  );
                }}
              >
                {deleteCommentMutation.isLoading ? (
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
