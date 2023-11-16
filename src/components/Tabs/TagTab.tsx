import { Combobox, Listbox } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { useState, useTransition } from "react";
import { api } from "~/utils/api";
import Loading from "../Loading";

const TagTab = () => {
  // get slug from url using useRouters
  const router = useRouter();
  const { slug } = router.query;

  const { data: tagData, isLoading } = api.tag.getTagsBySlug.useQuery({
    slug: slug as string,
  });

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

  return (
    <div className="">
      <div className="flex gap-2">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          tagData?.map((tagEntry) => (
            <div
              key={tagEntry.tag.id}
              style={{
                backgroundColor: tagEntry.tag.color,
                color: pickTextColorBasedOnBgColor(tagEntry.tag.color),
              }}
              className="rounded-md p-2"
            >
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
            className={"h-full w-full px-2"}
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

        <button className="flex-none rounded bg-indigo-500 p-2 text-white">
          Add Tag
        </button>
      </div>
    </div>
  );
};

function pickTextColorBasedOnBgColor(bgColor: string) {
  const lightColor = "#ffffff";
  const darkColor = "#000000";

  var color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor;
  var r = parseInt(color.substring(0, 2), 16); // hexToR
  var g = parseInt(color.substring(2, 4), 16); // hexToG
  var b = parseInt(color.substring(4, 6), 16); // hexToB
  var uicolors = [r / 255, g / 255, b / 255];
  var c = uicolors.map((col) => {
    if (col <= 0.03928) {
      return col / 12.92;
    }
    return Math.pow((col + 0.055) / 1.055, 2.4);
  });

  //check c[0] c[1] c[2]
  // if they are undefined, return darkColor
  if (c[0] === undefined || c[1] === undefined || c[2] === undefined) {
    return darkColor;
  }

  var L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  return L > 0.179 ? darkColor : lightColor;
}

export default TagTab;
