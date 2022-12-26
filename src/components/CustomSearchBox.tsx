import type { NextPage } from "next";
import { connectSearchBox } from "react-instantsearch-dom";

const SearchBox: NextPage<{
  currentRefinement: any;
  isSearchStalled: boolean;
  refine: any;
}> = ({ currentRefinement, refine }) => (
  <div>
    <input
      placeholder="Search for a article or author"
      autoFocus={true}
      type="search"
      value={currentRefinement}
      onChange={(event) => refine(event.currentTarget.value)}
      className="p-2 rounded-md w-full bg-slate-700/30 text-lg focus:outline-none text-white"
    />
  </div>
);

const CustomSearchBox = connectSearchBox(SearchBox);

export default CustomSearchBox;
