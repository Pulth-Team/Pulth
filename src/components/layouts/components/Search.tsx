//
//  Description: This file contains the search button component
//    which is used in the header of the website. It is a button
//    that opens a search modal when clicked.
//
//  Purpose: To provide a reusable search button component
//
//  Dependencies: tailwindcss, heroicons
//
//  Props:
//         className: string
//
//  Usage: <SearchButton />
//         <SearchButton className="..." />
//
// Notes: className is optional and if provided defaults to "TODO: add default class name"

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import SearchModal from "../../SearchModal";

const Search = ({ className }: { className?: string }) => {
  const [searchModal, setSearchModal] = useState(false);

  return (
    <>
      <button
        className={`ml-auto flex flex-row items-center gap-2 rounded-lg bg-gray-700 p-2 text-white hover:bg-gray-500 active:bg-gray-700 `}
        id="search-button"
        onClick={() => {
          setSearchModal(true);
        }}
      >
        <MagnifyingGlassIcon className={`h-6 w-6`}></MagnifyingGlassIcon>
        <p className="sr-only">Search</p>
      </button>
      <SearchModal isOpen={searchModal} setOpen={setSearchModal} />
    </>
  );
};

export default Search;
