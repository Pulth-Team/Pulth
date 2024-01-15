import { useContext, useState } from "react";
import InspectContext from "../contexts/Inspect";
import Link from "next/link";
import DeleteArticleDialog from "../Dialogs/DeleteArticleInspect";
import { api } from "~/utils/api";

const InspectorNavbar = () => {
  const article = useContext(InspectContext);

  const deleteArticleMutation = api.article.delete.useMutation();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <div className="flex max-w-full">
      <div className="inline-block w-full flex-grow">
        <p className="text-xs text-black/70">Inspect Article</p>
        <h1 className="mt-1 inline-block w-full max-w-full truncate text-2xl font-bold md:max-w-xs lg:max-w-lg xl:max-w-2xl 2xl:max-w-full">
          {article.title}
        </h1>
      </div>
      <div className="hidden gap-4 md:flex md:gap-2">
        <Link
          //href={"/articles/" + slug + "/edit"}
          href={{
            pathname: `/articles/[slug]/edit`,
            query: { slug: article.slug },
          }}
          className="mt-4"
        >
          <button className="flex h-full items-center justify-center rounded-lg bg-gray-500 px-4 py-2 text-white">
            Edit
          </button>
        </Link>

        {/* This Should open a model for confirmation */}
        <button
          className="mt-4 flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-white"
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete
        </button>

        <DeleteArticleDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          title={article.title}
          actionCallback={() => {
            deleteArticleMutation.mutate(article.slug);
          }}
          isActionLoading={deleteArticleMutation.isLoading}
        />
      </div>
    </div>
  );
};

export default InspectorNavbar;
