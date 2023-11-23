import { Combobox, Listbox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { useEffect, useState, useTransition } from "react";
import { api } from "~/utils/api";
import Loading from "../Loading";

const TagTab = () => {
  // get slug from url using useRouters
  const router = useRouter();
  const { slug } = router.query;

  const {
    data: tagData,
    isLoading,
    refetch: refetchTagData,
  } = api.tag.getTagsBySlug.useQuery({
    slug: slug as string,
  });

  const addTagMutation = api.tag.addTagToSlug.useMutation();

  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("");

  const [isInTimeout, setIsInTimeout] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const changeQuery = (newQuery: string) => {
    // check if there is a timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsInTimeout(true);

    console.log("in Timeout", isInTimeout);
    // set new timeout
    const timeout = setTimeout(() => {
      setQuery(newQuery);
      setIsInTimeout(false);

      setTimeoutId(null);
      console.log("out of Timeout", isInTimeout);
    }, 500);

    setTimeoutId(timeout);
  };

  // search
  const {
    data: filteredTagOptions,
    isLoading: isSearchLoading,
    isFetching: isSearching,
  } = api.tag.searchTags.useQuery(
    { query },
    {
      keepPreviousData: true,
    }
  );

  useEffect(() => {
    if (addTagMutation.isSuccess) {
      setSelectedTag("");
      refetchTagData();
    }
  }, [refetchTagData, addTagMutation.isSuccess]);

  return (
    <div className="">
      <div className="my-2 flex gap-2">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          tagData?.map((tagEntry) => (
            <div key={tagEntry.tag.id} className="rounded-md border p-2 shadow">
              {tagEntry.tag.name}
            </div>
          ))
        )}
      </div>

      <div className="flex gap-x-2">
        <Combobox
          as="div"
          className={"relative flex-grow"}
          value={selectedTag}
          onChange={setSelectedTag}
          nullable
        >
          <Combobox.Input
            className={"h-full w-full border px-2 shadow"}
            onChange={(event) => changeQuery(event.target.value)}
            autoComplete="off"
            placeholder="Search for tags..."
          />
          <Combobox.Options
            className={`absolute w-full rounded border p-2 shadow ${
              isInTimeout || isSearching ? "opacity-50" : ""
            }`}
          >
            {isSearchLoading ? (
              <Loading className="h-6 w-6 border-2" />
            ) : !filteredTagOptions || filteredTagOptions.length === 0 ? (
              <div className="p-2">No results found</div>
            ) : (
              filteredTagOptions?.map((tag) => (
                <Combobox.Option
                  key={tag.id}
                  value={tag.name}
                  className={({ active }) =>
                    `flex items-center justify-between rounded ${
                      active ? "bg-indigo-500 text-white" : "text-gray-900"
                    }`
                  }
                >
                  <div className="rounded-md p-2">{tag.name}</div>
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Combobox>

        <button
          className="flex-none rounded bg-indigo-500 p-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => {
            //check if tag exists
            const tag = filteredTagOptions?.find(
              (tag) => tag.name === selectedTag
            );

            // if tag doesnt exists, add tag to post
            if (tag) {
              addTagMutation.mutate({
                slug: slug as string,
                tagId: tag.id,
              });
            }
          }}
          disabled={addTagMutation.isLoading || !selectedTag}
        >
          {addTagMutation.isLoading && <Loading className="h-6 w-6 border-2" />}
          Add Tag
        </button>
      </div>
    </div>
  );
};

export default TagTab;
