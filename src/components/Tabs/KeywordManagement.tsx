import { XMarkIcon } from "@heroicons/react/24/outline";
import { api } from "~/utils/api";

const KeywordManagement = ({ keywords,slug }: { keywords: string[], slug:string }) => {
  const updateMutation = api.article.updateKeywords.useMutation();

  return (
    <div>
      <div className="my-2 flex gap-2">
        {keywords.map((keyword) => (
          <button
            className="group flex items-center gap-2 rounded-md border-2 p-2 text-sm hover:border-gray-400 hover:bg-gray-100"
            key={keyword}
            onClick={() => {
              if (keywords.length > 1) {
                const removedKeywords = keywords.filter((k) => k != keyword);

                if (removedKeywords.length == 0) {
                  console.log("no keywords left");
                  return;
                }

                if (removedKeywords[0])
                  updateMutation.mutate({
                    articleSlug: slug, 
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
        />
        <button className="rounded-md bg-indigo-500 p-2 text-white">Add</button>
      </div>
    </div>
  );
};

export default KeywordManagement;
