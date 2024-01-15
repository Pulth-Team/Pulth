import { XMarkIcon } from "@heroicons/react/24/outline";
import { useContext, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { api } from "~/utils/api";
import InspectContext from "../contexts/Inspect";
import Loading from "../Loading";

const KeywordManagement = () => {
  const article = useContext(InspectContext);
  const updateMutation = api.article.updateKeywords.useMutation();
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (updateMutation.isSuccess) {
      setInputValue("");
      updateMutation.reset();
      article.refetch();
    }
  }, [article, updateMutation.isSuccess, updateMutation]);

  return (
    <div>
      <div className="my-2 flex gap-2">
        {article.keywords.map((keyword) => (
          <button
            className="group flex items-center gap-2 rounded-md border-2 p-2 text-sm hover:border-gray-400 hover:bg-gray-100"
            key={keyword}
            onClick={() => {
              if (article.keywords.length > 1) {
                const removedKeywords = article.keywords.filter(
                  (k) => k != keyword
                );

                if (removedKeywords.length == 0) {
                  console.log("no keywords left");
                  return;
                }

                if (removedKeywords[0])
                  updateMutation.mutate({
                    articleSlug: article.slug,
                    keywords: [removedKeywords[0], ...removedKeywords.slice(1)],
                  });
                else console.log("no keywords left");
              } else
                console.log("not enough keywords to be able to delete one");
            }}
          >
            <span>{keyword}</span>
            <XMarkIcon className="h-6 w-6 stroke-gray-500 group-hover:stroke-gray-800" />
          </button>
        ))}
      </div>

      <div className="mb-4 flex justify-between gap-2">
        <input
          className="grow-1 w-full rounded-md border p-2 shadow "
          placeholder="Add new keyword..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          className={twMerge(
            "rounded-md bg-indigo-500 p-2 text-white",
            updateMutation.isLoading && "bg-indigo-400"
          )}
          onClick={() => {
            updateMutation.mutate({
              articleSlug: article.slug,
              keywords: [inputValue, ...article.keywords],
            });
          }}
        >
          {updateMutation.isLoading ? (
            <Loading className="h-6 w-6 border-2" />
          ) : (
            "Add"
          )}
        </button>
      </div>
    </div>
  );
};

export default KeywordManagement;
