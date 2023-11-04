import { Dispatch, Fragment, SetStateAction } from "react";
import Link from "next/link";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";

import algoliasearch from "algoliasearch/lite";
import { Hits, InstantSearch, Configure } from "react-instantsearch";

import CustomSearchBox from "./CustomSearchBox";
import { env } from "~/env.mjs";

interface searchModalProps {
  isOpen: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const SearchModal = ({ isOpen, setOpen }: searchModalProps) => {
  const searchClient = algoliasearch(
    env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    env.NEXT_PUBLIC_ALGOLIA_API_KEY
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        open={isOpen}
        onClose={() => setOpen(false)}
        className="relative z-20"
        as="div"
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-70"></div>
        </Transition.Child>
        <div className="fixed inset-0">
          <div className="flex h-full items-center justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Panel className="flex w-11/12 flex-col gap-y-4 rounded-md bg-gray-800 p-4 md:w-1/2">
                <InstantSearch
                  searchClient={searchClient}
                  indexName={env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME}
                >
                  <CustomSearchBox />
                  <Hits hitComponent={Hit} />
                  <Configure hitsPerPage={5} />
                </InstantSearch>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SearchModal;

interface HitProps {
  hit: {
    objectID: string;
    author: {
      id: string;
      name: string;
      image?: string;
    };
    description: string;
    title: string;
    slug: string;
  };
}

function Hit({ hit }: HitProps) {
  return (
    <Link
      // href={`/articles/${hit.slug}`}
      href={{
        pathname: "/articles/[slug]",
        query: { slug: hit.slug },
      }}
    >
      <div
        className="mb-2 flex cursor-pointer flex-row items-center justify-between rounded-md bg-slate-700/30 p-1.5 hover:bg-indigo-900/70"
        // onClick={() => setSearchModal(false)}
      >
        <div className="flex flex-col gap-y-1">
          <p className="line-clamp-1 text-lg font-bold text-white md:text-xl">
            {hit.title}
          </p>
          <p className="line-clamp-2 text-base font-semibold italic text-gray-400 md:line-clamp-1">
            {hit.description}
          </p>
          <div className="mt-2 flex items-center gap-x-2">
            {/* <UserCircleIcon className="h-5 w-5 stroke-white" /> */}

            <div className="relative h-8 w-8 ">
              <Image
                src={hit.author.image ?? "/default_profile.jpg"}
                alt={hit.author.name + "'s profile photo"}
                layout="fill"
                className="mr-2 rounded-full"
              />
            </div>
            <Link
              // href={"/user/" + hit.author.id}
              href={{
                pathname: "/user/[userId]",
                query: { userId: hit.author.id },
              }}
            >
              <p className="font-semibold text-gray-400 hover:underline">
                {hit.author.name}
              </p>
            </Link>
          </div>
        </div>
      </div>
    </Link>
  );
}
