import Image from "next/legacy/image";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import Loading from "~/components/Loading";

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
  maxLength = 255,
  collapsable = false,
  cancelText = "Cancel",
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

  collapsable?: boolean;
  cancelText?: "Cancel" | "Reset" | string;
  // className: the class name of the root div
  className?: string;
  maxLength?: number;
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
    <div className={`flex gap-3 align-top ${className}`}>
      {/* next-image with fill and square layout */}
      <div className="relative h-8 w-8 flex-shrink-0">
        <Image
          src={user.image || "/default_profile.jpg"}
          alt="Current User's photo"
          layout="fill"
          className="absolute rounded-full"
        />
      </div>
      <div className="group flex flex-grow flex-col gap-1 ">
        <div className="font-semibold leading-5">{user.name}</div>
        <textarea
          className="w-full resize-none overflow-y-hidden rounded-md border-2 border-gray-200 bg-[#fafafa] px-2 py-1 outline-gray-300"
          ref={textAreaRef}
          onChange={onChange}
          value={val}
          placeholder="Write a comment..."
          maxLength={maxLength}
          minLength={1}
        ></textarea>
        <div
          className={twMerge(
            "justify-end gap-2 ",
            collapsable ? (val.length > 0
              ? "group-focus-within:flex flex"
              : "hidden") : "flex"
          )}
        >
          <span className="text-sm text-gray-500">
            {val.length}/{maxLength}
          </span>
          <button
            className="flex items-center gap-2 rounded-md bg-indigo-500 p-2 text-white hover:bg-indigo-400 active:bg-indigo-600 disabled:bg-indigo-400"
            onClick={() => {
              OnComment({
                parent: parentId === null ? undefined : parentId,
                content: val,
              });
              setVal("");
            }}
            disabled={val.length == 0 || isLoading}
          >
            {isLoading ? <Loading className="h-6 w-6 border-2" /> : ""}
            Send
          </button>
          <button
            className="rounded-md bg-gray-200 p-2 hover:bg-gray-300 active:bg-gray-400"
            onClick={() => {
              if (OnCancel) OnCancel();
              setVal("");
            }}
          >
            
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentAdd;
export type { AddCommentData };
