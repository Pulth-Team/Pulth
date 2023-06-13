import { NextPage } from "next";
import {
  EllipsisVerticalIcon,
  ShareIcon,
  LockClosedIcon,
  ArrowUturnRightIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Menu } from "@headlessui/react";
import Loading from "~/components/Loading";

const EditorTopbar: NextPage<{
  title: string;
  onSave: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onMenuClick: (type: "delete" | "undo-changes" | "share") => void;
  saveLoading: boolean;

  // is this article published to the public
  isPublished: boolean;
  // is this article has unpublished changes (saved/remote changes)
  isDraft: boolean;
  // is this article has unpublished changes (local changes)
  isChanged: boolean;

  publishLoading: boolean;
}> = ({
  title,
  onSave,
  onPublish,
  onUnpublish,
  onMenuClick,
  saveLoading,
  isPublished,
  isDraft,
  isChanged,
  publishLoading,
}) => {
  type SaveText = "Save Draft" | "Saved" | "Saved / Published" | "Unknown";
  type PublishText =
    | "Publish"
    | "Publish Draft"
    | "Save & Publish"
    | "Published"
    | "Unpublish"
    | "Unknown";

  let saveText: SaveText = "Unknown";
  let publishText: PublishText = "Unknown";

  let isUnpublishAct = false;

  // if the article is published and has no changes (local or remote)
  if (isPublished && !isDraft && !isChanged) {
    saveText = "Saved / Published";
    publishText = "Unpublish";
    isUnpublishAct = true;
  }

  // if the article is published and has local changes (not remote)
  if (isPublished && !isDraft && isChanged) {
    saveText = "Save Draft";
    publishText = "Save & Publish";
    isUnpublishAct = false;
  }

  // if the article is published and has remote changes (not local)
  if (isPublished && isDraft && !isChanged) {
    saveText = "Saved";
    publishText = "Publish Draft";
    isUnpublishAct = false;
  }

  // if the article is published and has local and remote changes
  if (isPublished && isDraft && isChanged) {
    saveText = "Save Draft";
    publishText = "Save & Publish";
    isUnpublishAct = false;
  }


  // if the article is not published and has no changes (local or remote)
  if (!isPublished  && !isChanged) {
    saveText = "Saved";
    publishText = "Publish Draft";
    isUnpublishAct = false;
  }

  // if the article is not published and has local changes (not remote)
  if (!isPublished  && isChanged) {
    saveText = "Save Draft";
    publishText = "Save & Publish";
    isUnpublishAct = false;
  }




  return (
    <div className="sticky top-0 z-10 mb-4 flex items-center gap-x-2 bg-white px-4 py-2 shadow-md">
      <h1 className="mr-auto">
        <span className="sr-only">Title of the article</span>
        {title}
      </h1>
      <button
        className="flex items-center gap-2 rounded-md px-2 py-1 text-black/70"
        onClick={() => onSave()}
      >
        {saveLoading && <Loading className="w-4 border-2" />}
        {saveText}
      </button>
      <button
        className="flex items-center gap-2 rounded-md bg-indigo-600 p-2 px-4 font-medium text-white"
        onClick={() => {
          if (isUnpublishAct) 
          onUnpublish();
          else

          onPublish()
        }}
      >
        {publishLoading && <Loading className="w-4 border-2" />}
        {publishText}
      </button>
      <Menu as="div" className="">
        <Menu.Button className="flex items-center">
          <div className="self-stretch rounded-md">
            <EllipsisVerticalIcon className="h-6 w-6" />
          </div>
        </Menu.Button>
        <Menu.Items className="absolute z-10 flex w-48 -translate-x-40 translate-y-5 flex-col items-start justify-start rounded bg-white py-2 shadow-md">
          <Menu.Item
            className="flex w-full items-center gap-x-3 self-start p-2 text-left hover:bg-gray-100"
            as="button"
            onClick={() => onMenuClick("share")}
          >
            <ShareIcon className="h-5 w-5" />
            <p>Share</p>
          </Menu.Item>
          <Menu.Item
            className="flex w-full items-center gap-x-3 self-start p-2 text-left hover:bg-gray-100"
            as="button"
            onClick={() => onMenuClick("undo-changes")}
          >
            <ArrowUturnRightIcon className="h-5 w-5" />
            <p>Undo Changes</p>
          </Menu.Item>
          <hr className="" />
          <Menu.Item
            className="flex w-full items-center gap-x-3 self-start p-2 text-left hover:bg-gray-100"
            as="button"
            onClick={() => onMenuClick("delete")}
            // onClick={() => deleteArticleFetch.refetch()}
          >
            <TrashIcon className="h-5 w-5" />
            <p>Delete</p>
          </Menu.Item>
        </Menu.Items>
      </Menu>
    </div>
  );
};

export default EditorTopbar;
