export interface CommentData {
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

export class CommentNode {
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

  public static fromComment(comment: CommentData) {
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

  addComment(comment: CommentData) {
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
          pathExists.addChild(CommentNode.fromComment(comment));
        } else {
          console.log("path doesn't exist", pathExists);
        }
      }
    }
  }
}

const structureComments = (comments: CommentData[]) => {
  const commentTree = new CommentTree();

  comments.forEach((comment) => {
    commentTree.addComment(comment);
  });

  return commentTree;
};

export { structureComments };
