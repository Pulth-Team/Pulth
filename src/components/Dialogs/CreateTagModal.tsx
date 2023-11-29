"use client";

import { Dialog } from "@headlessui/react";
import { api } from "~/utils/api";
import { useState, useRef } from "react";

interface CreateTagModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTagModal = ({ isOpen, onClose }: CreateTagModalProps) => {
  const createTagMutation = api.tag.createTag.useMutation();

  const tagNameInputRef = useRef<HTMLInputElement>(null);

  const [tagName, setTagName] = useState("");

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-30"
    >
      <Dialog.Panel className="group w-full max-w-md rounded-md bg-white p-4">
        <Dialog.Title className="text-xl font-bold">Create Tag</Dialog.Title>
        <Dialog.Description className="text-base">
          Create a new tag for this post.
        </Dialog.Description>
        <div className="mt-4">
          <label htmlFor="tag_name" className="">
            Shown Name
          </label>
          <input
            type="text"
            placeholder="Tag Name"
            className=" w-full rounded border-2 p-2 invalid:border-red-500 invalid:outline-red-500"
            name="tag_name"
            // accept only alpha-numeric characters
            pattern="(\w*)( ?(\w+))*"
            // pattern="(\w*)(\W)*(( )*([A-Z]+\w*))*"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            ref={tagNameInputRef}
          />
        </div>
        <div className="mt-4 flex items-center">
          <p>/tags/</p>
          <input
            type="text"
            value={tagName
              .replaceAll(/[^a-zA-z ]/g, "")
              .toLowerCase()
              .replaceAll(/ +/g, "-")}
            className="inline-block flex-shrink flex-grow rounded border p-1"
            disabled={true}
          />
          <p>/</p>
        </div>

        <div className="mt-2 flex justify-end">
          <button
            className="rounded bg-indigo-500 p-2 text-white disabled:bg-indigo-200"
            onClick={() => {
              createTagMutation.mutate({
                name: tagName,
                slug: tagName
                  .replaceAll(/[^a-zA-z ]/g, "")
                  .toLowerCase()
                  .replaceAll(/ +/g, "-"),
              });
              onClose();
            }}
            disabled={tagNameInputRef.current?.checkValidity() === false}
          >
            {createTagMutation.isLoading ? "Creating..." : "Create"}
            &nbsp;Tag
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default CreateTagModal;
