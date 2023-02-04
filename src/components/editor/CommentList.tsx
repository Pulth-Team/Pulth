import Comment, { CommentData } from "./comment";

const CommentList = ({
  comments,
  currentUser,
  currentArticleId,
  OnAnyEdit,
}: {
  // comments of the article
  // its array beacuse its root comments
  comments?: CommentData[];

  // current user data
  // used to check if the user is the owner of the comment
  // data is distributed to the comment component
  currentUser: {
    id: string;
    name: string;
    image: string;
  };
  // current article id
  // used to create a new comment in a mutation
  currentArticleId: string;
  // OnAnyEdit is a callback function that is called when this comment or its children are edited
  OnAnyEdit?: () => void;
}) => {
  // if there are no comments return a message
  if (!comments) return <>No comments yet </>;

  // create a comment tree using CommentNode class
  let RootNode = new CommentNode("root", null);

  // go through all comments and add them to the tree
  comments.map((comment) => {
    // if the comment has no parent add it to the root node
    if (comment.parentId === null) {
      RootNode.AddNode(new CommentNode(comment));
      return;
    } else {
      // if the comment has a parent find the parent node and add the comment to it
      let parentNode = RootNode.FindNode(comment.parentId);
      // if parentNode is not null then there is a parent node in the tree already !!
      if (parentNode !== null) {
        // Add this node to the parent node
        parentNode.AddNode(new CommentNode(comment));
      } else {
        // if the parent node is not found in the tree
        // we need to save it in the another array
        // and add it to the tree later
        // this is because the parent node may not be added to the tree yet
        // TODO: add the node to the tree later
        // WARNINNG: this may cause a bug if the parent node is not added to the tree
      }
    }
  });

  // after adding all comments to the tree
  // apply the tree to the root node so we can render the tree
  const CommentRenderTree = RootNode.ApplyTree();

  return (
    <div className="flex flex-col gap-2">
      {CommentRenderTree?.map((comment) => (
        <Comment
          key={comment.id}
          comment={comment}
          currentUser={currentUser}
          currentArticleId={currentArticleId}
          commentDepth={0}
          OnAnyEdit={OnAnyEdit || (() => {})}
        />
      ))}
    </div>
  );
};

export default CommentList;

// Comment Tree
class CommentNode {
  id: string;
  parentId: string | null;
  parentNode: CommentNode | null = null;
  children: CommentNode[];
  data: CommentData | null = null;

  constructor(data: CommentData);
  constructor(id: string, parentId: string | null);

  public constructor(...arr: any[]) {
    if (arr.length === 1) {
      // if there is only one argument then it is a CommentData
      const data = arr[0];
      // set the needed data
      this.id = data.id;
      this.data = data;
      this.children = [];

      // if the parent id is null then set it to null
      // else set it to the parent id
      // data.parentId is null if the comment is a root comment
      this.parentId = data.parentId;
    } else if (arr.length === 2) {
      // if there are two arguments then it is a id and a parent id
      // destructure the arguments
      const id = arr[0];
      const parentId = arr[1];

      // set the needed data
      this.id = id;
      this.parentId = parentId;
      this.children = [];
    } else {
      // if there are more than two arguments then throw an error
      throw new Error("Invalid number of arguments");
    }
  }

  ///
  /// Find a node in the tree using its id
  ///
  FindNode(id: string): CommentNode | null {
    // if the id is the same as the current node id then return the current node
    if (this.id === id) return this;

    // go through all children
    for (let i = 0; i < this.children.length; i++) {
      let childNode = this.children[i];

      // if the child node is undefined throw an error
      if (typeof childNode === "undefined")
        throw new Error("Child node is undefined");

      // if the child node is not null  then Call FindNode on the child node
      let result = childNode.FindNode(id);
      // if the result is not null then we found the node
      if (result !== null) return result;
    }

    // if we exited the loop then we did not find the node so return null
    return null;
  }

  // Add a node to the children array
  AddNode(childNode: CommentNode) {
    this.children.push(childNode);
  }

  ///
  /// Apply the tree to the node
  ///
  /// this function applies the tree structure to the node and returns the CommentData
  /// the diffrence between this function and ApplyChildren is that this function applies the tree
  /// to the root node and return the array of root nodes while ApplyChildren applies the tree to
  /// the CommentData and returns the whole comment. But there is such thing as a root node(Comment)
  /// so we need to apply the tree to the root node and return the array of root nodes
  ///
  ApplyTree(): CommentData[] {
    let result: CommentData[] = [];

    // go through all children
    for (let i = 0; i < this.children.length; i++) {
      let childNode = this.children[i];
      // if the child node is undefined throw an error
      if (typeof childNode === "undefined")
        throw new Error("Child node is undefined");

      // Call ApplyChildren on the child node
      // and push the result to the result array
      result.push(childNode.ApplyChildren());
    }
    // we have the array of root nodes so return it
    return result;
  }

  ///
  /// Apply the children of the node to the data
  ///
  /// This function applies the tree structure to the CommentData and returns the CommentData
  ///
  ApplyChildren(): CommentData {
    // if the data is null throw an error
    if (this.data === null) throw new Error("Data is null");
    // if the node has no children then return the data
    if (this.children.length === 0) return this.data;

    let result: CommentData[] = [];
    for (let index = 0; index < this.children.length; index++) {
      const childNode = this.children[index];

      // if the child node is undefined throw an error
      if (typeof childNode === "undefined")
        throw new Error("Child node is undefined");

      // Call ApplyChildren on the child node to get the CommentData
      // then apply it to the result array
      result.push(childNode.ApplyChildren());
    }
    // after the loop is done set the subComments to the result
    this.data.subComments = result;

    // now we are done with the children so return the data
    return this.data;
  }
}
