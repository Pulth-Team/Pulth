import { useSearchBox } from "react-instantsearch";

const CustomSearchBox = () => {
  const { query, refine, clear } = useSearchBox();

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(event) => refine(event.currentTarget.value)}
        placeholder="Type any article title..."
        className="w-full rounded-md bg-gray-700 p-2 text-white"
      />
    </div>
  );
};

export default CustomSearchBox;
