import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import Loading from "../Loading";

interface AddCommentData {
  parent?: string;
  content: string;
}

const CommentAdd = ({
  user,
  OnComment,
  OnCancel,
  isLoading,
  parentId = null,
  className,
}: {
  // user: the current use who writes this comment
  user: {
    name: string;
    image: string;
  };

  // OnComment: Event callback when the user clicks the Send comment button
  OnComment: (comment: AddCommentData) => void;
  // Event callback when the user clicks the Cancel button
  OnCancel?: () => void;

  // isLoading: whether the comment is being sent to the server
  isLoading: boolean;
  // parentId: the id of the parent comment
  //           only used to give as an argument to OnComment
  parentId?: string | null;

  // className: the class name of the root div
  className?: string;
}) => {
  // val: the value of the textarea
  const [val, setVal] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // resizeTextArea: resize the textarea to fit the height of the content
  const resizeTextArea = () => {
    if (textAreaRef == null || textAreaRef.current == null) return;

    textAreaRef.current.style.height = "auto";
    textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px";
  };

  // resize the textarea when the value changes
  useEffect(resizeTextArea, [val]);

  // onChange: event handler for the textarea
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setVal(e.target.value);
  };

  return (
    <div className={`flex align-top gap-3 ${className}`}>
      {/* next-image with fill and square layout */}
      <div className="w-8 h-8 relative flex-shrink-0">
        <Image
          src={user.image || "/default_profile.jpg"}
          alt="Current User's photo"
          layout="fill"
          className="absolute rounded-full"
        />
      </div>
      <div className="flex flex-col gap-1 flex-grow">
        <div className="leading-5 font-semibold">{user.name}</div>
        <textarea
          className="bg-[#fafafa] rounded-md outline-gray-300 w-full px-2 py-1 resize-none border-2 border-gray-200 overflow-y-hidden"
          ref={textAreaRef}
          onChange={onChange}
          value={val}
          placeholder="Write a comment..."
        ></textarea>
        <div className="flex justify-end gap-2">
          <button
            className="p-2 bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 rounded-md text-white flex gap-2 items-center disabled:bg-indigo-400"
            onClick={() => {
              // TODO: check isSuccess and show error if not
              // if isSuccess is true, clear the textarea
              OnComment({
                parent: parentId === null ? undefined : parentId,
                content: val,
              });
              setVal("");
            }}
            disabled={val.length == 0 || isLoading}
          >
            {isLoading ? <Loading className="w-6 h-6 border-2" /> : ""}
            Send
          </button>
          <button
            className="p-2 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 rounded-md"
            onClick={() => {
              if (OnCancel) OnCancel();
              setVal("");
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentAdd;
export type { AddCommentData };
