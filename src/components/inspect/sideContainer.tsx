import { useContext, useState } from "react";
import InspectContext from "../contexts/Inspect";
import Link from "next/link";
import dayjs from "dayjs";
import DeleteArticleDialog from "../Dialogs/DeleteArticleInspect";
import { api } from "~/utils/api";

const SideContainer = () => {
  const article = useContext(InspectContext);

  const deleteArticleMutation = api.article.delete.useMutation();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <div className="order-first mt-4 grid w-full gap-x-2 self-start rounded-xl border p-2 shadow-md md:order-last md:col-span-2 md:w-auto md:min-w-max md:max-w-md md:flex-shrink md:flex-grow-0 md:grid-cols-[min,min] lg:col-span-1 lg:flex-grow">
      <span className="text-black/70">status:</span>

      <p>{article.isPublished ? "published" : "unpublished/draft"}</p>

      {/* <span className="text-black/70">visibility:</span>
Private, Public, Unlisted

for subscribers only, for everyone, for subscribers and people with link */}

      <span className="text-black/70 ">updated at:</span>
      <p>{dayjs(article.updatedAt).fromNow()}</p>

      <span className="text-black/70">created at:</span>
      <p>{dayjs(article.createdAt).fromNow()}</p>

      {article.isPublished ? (
        <Link
          //href={"/articles/" + slug}
          href={{
            pathname: "/articles/[slug]",
            query: { slug: article.slug },
          }}
          className="col-span-2 mb-2 mt-8 flex items-center justify-center rounded-lg bg-gray-500 px-4 py-2 text-white disabled:bg-gray-400 md:mb-0"
        >
          View
        </Link>
      ) : (
        <button
          className="col-span-2 mb-2 mt-8 flex items-center justify-center rounded-lg bg-gray-500 px-4 py-2 text-white disabled:bg-gray-400 md:mb-0"
          disabled={!article.isPublished}
        >
          View
        </button>
      )}

      <Link
        href={{
          pathname: "/articles/[slug]/edit",
          query: { slug: article.slug },
        }}
        className=" flex items-center justify-center rounded-lg bg-gray-500 px-4 py-2 text-white md:mb-2 md:mt-6 md:hidden"
      >
        Edit
      </Link>
      {/* This Should open a model for confirmation */}
      <button
        className="flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-white md:mb-2 md:mt-6 md:hidden"
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
  );
};

export default SideContainer;
