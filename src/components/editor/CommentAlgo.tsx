import { NextPage } from "next";
import Image from "next/image";
import { ArrowUturnLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import CommentAdd from "./addComment";
import { api } from "~/utils/api";
import { signIn } from "next-auth/react";

interface Comment {
  id: string;
  content: string;
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
          console.log(
            "path exists",
            { content: pathExists.content, id: pathExists.id },
            {
              content: comment.content,
              id: comment.id,
              given: comment.parentIds.slice(1),
            }
          );

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
            isAuthed={isAuthed}
            articleId={articleId}
            revalidate={revalidate}
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
  revalidate: () => void;
}> = ({ comment, user, articleId, revalidate, isAuthed }) => {
  const [reply, setReply] = useState(false);
  const addCommentMutation = api.comment.create.useMutation();
  const deleteCommentMutation = api.comment.delete.useMutation();

  const amITheAuthor = comment.author.id === user.id;
  return (
    <div className="">
      <div className="flex gap-2">
        <div className="relative h-8 w-8 flex-shrink-0 flex-grow-0">
          <Image
            src={comment.author.image || "/default_profile.jpg"}
            alt={comment.author.image + " profile image"}
            layout="fill"
            className="absolute rounded-full"
          ></Image>
        </div>
        <div>
          <p className="font-semibold leading-5">{comment.author.name}</p>
          <p className="">{comment.content}</p>
        </div>
        <ArrowUturnLeftIcon
          className="ml-auto h-5 w-5 text-black/70 hover:text-black"
          onClick={() => {
            if (isAuthed) setReply(!reply);
            else signIn();
          }}
        />
        {amITheAuthor && (
          <TrashIcon
            className="h-5 w-5 text-black/70 hover:text-black"
            onClick={() => {
              deleteCommentMutation.mutate(
                { id: comment.id },
                {
                  onSuccess: () => {
                    revalidate();
                  },
                }
              );
            }}
          />
        )}
      </div>

      <div className="flex flex-col gap-2 pl-10 pt-2">
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
              isAuthed={isAuthed}
              articleId={articleId}
              revalidate={revalidate}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CommentAlgo;
