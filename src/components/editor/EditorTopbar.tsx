import { NextPage } from "next";
import {
  EllipsisVerticalIcon,
  ShareIcon,
  LockClosedIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Menu } from "@headlessui/react";
import { trpc } from "../../utils/trpc";
import Loading from "../Loading";

const EditorTopbar: NextPage<{
  slug: string;
  onSave: () => void;
  saveLoading: boolean;
}> = ({ slug, onSave, saveLoading }) => {
  const publishArticleQuery = trpc.useQuery(
    ["article.publishArticle", { slug }],
    {
      enabled: false,
    }
  );

  return (
    <div className="flex gap-x-2 px-4 bg-white shadow-md mb-4 py-2 items-center">
      <h1 className="mr-auto">
        <span className="sr-only">Title of the article</span>
        Title
      </h1>
      <button
        className="rounded-md text-black/70 px-2 py-1 flex gap-2 items-center"
        onClick={() => onSave()}
      >
        {saveLoading && <Loading className="w-4 border-2" />}
        Save
      </button>
      <button
        className="rounded-md font-medium p-2 px-4 bg-indigo-600 text-white flex gap-2 items-center"
        onClick={() => publishArticleQuery.refetch()}
      >
        {publishArticleQuery.isLoading && <Loading className="w-4 border-2" />}
        Publish
      </button>
      <Menu as="div" className="">
        <Menu.Button className="flex items-center">
          <div className="rounded-md self-stretch">
            <EllipsisVerticalIcon className="w-6 h-6" />
          </div>
        </Menu.Button>
        <Menu.Items className="absolute z-10 rounded translate-y-5 -translate-x-28 bg-white shadow-md py-2 flex flex-col items-start justify-start w-36">
          <Menu.Item
            className="p-2 hover:bg-gray-100 self-start w-full text-left flex gap-x-3 items-center"
            as="button"
          >
            <ShareIcon className="w-5 h-5" />
            <p>Share</p>
          </Menu.Item>
          <Menu.Item
            className="p-2 hover:bg-gray-100 self-start w-full text-left flex gap-x-3 items-center"
            as="button"
          >
            <LockClosedIcon className="w-5 h-5" />
            <p>Privacy</p>
          </Menu.Item>
          <Menu.Item
            className="p-2 hover:bg-gray-100 self-start w-full text-left flex gap-x-3 items-center"
            as="button"
          >
            <PencilSquareIcon className="w-5 h-5" />
            <p>Edit</p>
          </Menu.Item>
          <hr className="" />
          <Menu.Item
            className="p-2 hover:bg-gray-100 self-start w-full text-left flex gap-x-3 items-center"
            as="button"
          >
            <TrashIcon className="w-5 h-5" />
            <p>Delete</p>
          </Menu.Item>
        </Menu.Items>
      </Menu>
    </div>
  );
};

export default EditorTopbar;
