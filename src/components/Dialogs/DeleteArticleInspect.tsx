import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import Loading from "../Loading";

interface DeleteArticleInspectProps {
  isOpen: boolean;
  onClose: () => void;

  title: string;
  actionCallback: () => void;
  isActionLoading: boolean;
}

const DeleteArticleInspect = ({
  isOpen,
  onClose,
  actionCallback,
  isActionLoading,
  title,
}: DeleteArticleInspectProps) => {
  const [articleNameInput, setArticleNameInput] = useState("");

  // useEffect(() => {
  //   if (!isActionLoading && articleNameInput === title) {
  //     onClose();
  //   }
  // }, [isActionLoading, articleNameInput, title, onClose]);

  return (
    <Dialog
      open={isOpen}
      onClose={() => onClose()}
      className={
        "fixed inset-0 z-10 flex items-center justify-center overflow-y-auto"
      }
    >
      <Dialog.Overlay
        className={"fixed inset-0  bg-black/50 backdrop-blur-md"}
      />
      <Dialog.Panel className={"z-10 max-w-xl rounded-xl bg-white p-2"}>
        <Dialog.Title className={"mb-2 text-xl font-semibold"}>
          Delete Article
        </Dialog.Title>
        <Dialog.Description className={"texl-lg"}>
          All of the comments and data associated with this article will be
          permanently deleted. This action cannot be undone.
          <br />
          <br />
          Are you sure you want to delete
          <span className="font-bold">&quot;{title}&quot;</span>?
        </Dialog.Description>

        <input
          className="my-2 w-full rounded-lg border-2 p-2"
          onChange={(e) => setArticleNameInput(e.target.value)}
        />
        {articleNameInput !== title && (
          <p className="mb-2 text-xs text-red-500">
            Please type the title of the article to confirm
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button
            disabled={articleNameInput !== title}
            onClick={() => {
              actionCallback();
              onClose();
            }}
            className="mt-4 flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-white disabled:bg-red-400"
          >
            {isActionLoading && <Loading className="mr-2 h-6 w-6 border-2" />}
            Delete
          </button>
          <button
            onClick={() => {
              onClose();
              setArticleNameInput("");
            }}
            className=" mt-4 flex items-center justify-center rounded-lg bg-gray-500 px-4 py-2 text-white"
          >
            Cancel
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default DeleteArticleInspect;
