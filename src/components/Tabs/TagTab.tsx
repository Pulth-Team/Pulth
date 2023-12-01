import { Combobox, Listbox } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import Loading from "../Loading";
import CreateTagModal from "../Dialogs/CreateTagModal";

const TagTab = () => {
  // get slug from url using useRouters
  const router = useRouter();
  const { slug } = router.query;

  const {
    data: tagData,
    isLoading: isTagDataLoading,
    refetch: refetchTagData,
  } = api.tag.getTagsBySlug.useQuery({
    slug: slug as string,
  });

  const addTagMutation = api.tag.addTagToSlug.useMutation();
  const removeTagMutation = api.tag.removeTagFromSlug.useMutation();

  const [query, setQuery] = useState("");
  const [QuerySelectionTag, setQuerySelectionTag] = useState<string>("");
  const [deleteTagId, setDeleteTagId] = useState<string>("");

  const [isInTimeout, setIsInTimeout] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [createTagIsOpen, setCreateTagIsOpen] = useState(false);

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
      setQuerySelectionTag("");
      refetchTagData();
    } else {
      // TODO: Add Toast for error
    }
  }, [refetchTagData, addTagMutation.isSuccess, addTagMutation.error]);

  useEffect(() => {
    if (removeTagMutation.isSuccess) {
      setDeleteTagId("");
      refetchTagData();
    }
  }, [refetchTagData, removeTagMutation.isSuccess]);

  return (
    <div className="">
      <div className="my-2 flex gap-2">
        {isTagDataLoading ? (
          <Loading className="h-6 w-6 border-2" />
        ) : (
          tagData?.map((tagEntry) => (
            <button
              key={tagEntry.tag.id}
              className="group flex items-center gap-2 rounded-md border-2 p-2 text-sm hover:border-gray-400 hover:bg-gray-100"
              onClick={() => {
                // call remove tag mutation
                removeTagMutation.mutate({
                  slug: slug as string,
                  tagId: tagEntry.tag.id,
                });

                // set delete tag id
                setDeleteTagId(tagEntry.tag.id);
              }}
            >
              <p className="flex-shrink-0 flex-grow break-keep">
                {tagEntry.tag.name}
              </p>
              <div className="rounded ">
                {removeTagMutation.isLoading &&
                deleteTagId == tagEntry.tag.id ? (
                  <Loading className="h-6 w-6 border-2" />
                ) : (
                  <XMarkIcon className="h-6 w-6 stroke-gray-500 group-hover:stroke-gray-800" />
                )}
              </div>
            </button>
          ))
        )}
      </div>
      <div className="flex gap-x-2">
        <Combobox
          as="div"
          className={"relative flex-grow"}
          value={QuerySelectionTag}
          onChange={setQuerySelectionTag}
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
              <div className="flex items-center p-2">
                <p> No results found.</p>
                <button
                  className="ml-2 rounded bg-indigo-500 p-2 text-white"
                  onClick={() => {
                    // open create tag modal
                    setCreateTagIsOpen(true);
                  }}
                >
                  Create Tag
                </button>
              </div>
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
          className="flex-non flex gap-2 rounded bg-indigo-500 p-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => {
            //check if tag exists
            const tag = filteredTagOptions?.find(
              (tag) => tag.name === QuerySelectionTag
            );

            // if tag doesnt exists, add tag to post
            if (tag) {
              addTagMutation.mutate({
                slug: slug as string,
                tagId: tag.id,
              });
            }
          }}
          disabled={addTagMutation.isLoading || !QuerySelectionTag}
        >
          {addTagMutation.isLoading && <Loading className="h-6 w-6 border-2" />}
          Add Tag
        </button>

        <CreateTagModal
          isOpen={createTagIsOpen}
          onClose={() => {
            setCreateTagIsOpen(false);
          }}
        />
      </div>
    </div>
  );
};

export default TagTab;
