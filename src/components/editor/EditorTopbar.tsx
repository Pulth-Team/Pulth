import { NextPage } from "next";
import {
  EllipsisVerticalIcon,
  ShareIcon,
  LockClosedIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Menu } from "@headlessui/react";
import Loading from "~/components/Loading";

const EditorTopbar: NextPage<{
  title: string;
  onSave: () => void;
  onPublish: () => void;
  onMenuClick: (type: "delete" | "privacy" | "share" | "configure") => void;
  saveLoading: boolean;
  isPublished: boolean;
  publishLoading: boolean;
}> = ({
  title,
  onSave,
  onPublish,
  onMenuClick,
  saveLoading,
  isPublished,
  publishLoading,
}) => {
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
        {isPublished ? "Update" : "Save"}
      </button>
      <button
        className="flex items-center gap-2 rounded-md bg-indigo-600 p-2 px-4 font-medium text-white"
        onClick={() => onPublish()}
      >
        {publishLoading && <Loading className="w-4 border-2" />}
        {isPublished ? "Unpublish" : "Publish"}
      </button>
      <Menu as="div" className="">
        <Menu.Button className="flex items-center">
          <div className="self-stretch rounded-md">
            <EllipsisVerticalIcon className="h-6 w-6" />
          </div>
        </Menu.Button>
        <Menu.Items className="absolute z-10 flex w-36 translate-y-5 -translate-x-28 flex-col items-start justify-start rounded bg-white py-2 shadow-md">
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
            onClick={() => onMenuClick("configure")}
          >
            <PencilSquareIcon className="h-5 w-5" />
            <p>Configure</p>
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
