import type { NextPage } from "next";

import Link from "next/link";
import Image from "next/image";

import { Dialog, Menu, Transition } from "@headlessui/react";

import { signOut } from "next-auth/react";
import { useRouter } from "next/router";

// import BatchRenderer from "../components/BatchRenderer";

import CustomSearchBox from "../CustomSearchBox";

import { useSession } from "next-auth/react";
import React, { Fragment, useState } from "react";
import {
  HomeIcon,
  MapIcon,
  PhotoIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  Cog8ToothIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

import { motion, AnimatePresence } from "framer-motion";
import algoliasearch from "algoliasearch/lite";
import {
  SearchBox,
  InstantSearch,
  RefinementList,
  Hits,
} from "react-instantsearch-dom";

const Dashboard: NextPage<{ children: React.ReactNode }> = ({ children }) => {
  // const batchFetch = trpc.useQuery(["article.batch-data"]);
  const router = useRouter();
  const { data } = useSession();
  const user = data?.user;
  const [searchModal, setSearchModal] = useState(false);

  const searchClient = algoliasearch(
    "BNEEQPGY1H",
    "d20546fd91f26a1493abd70457c47e7b"
  );
  function Hit({ hit }: { hit: any }) {
    console.log(hit);
    return (
      <Link href={`/articles/${hit.slug}`}>
        <div
          className="bg-slate-700/30 hover:bg-indigo-900/70 p-1.5 rounded-md mb-2 cursor-pointer flex flex-row justify-between items-center"
          onClick={() => setSearchModal(false)}
        >
          <div className="flex flex-col gap-y-2">
            <p className="text-xl line-clamp-1 text-white font-bold">
              {hit.title}
            </p>
            <p className="text-gray-400 italic text-sm line-clamp-1 font-semibold">
              {hit.description}
            </p>
            <Link href="/profile">
              <div className="flex gap-x-1 items-center">
                <UserCircleIcon className="stroke-white h-5 w-5" />
                <p className="text-gray-400 font-semibold hover:underline">
                  {hit.author}
                </p>
              </div>
            </Link>
          </div>
          <ChevronRightIcon className="stroke-white h-4 w-4 flex-shrink-0" />
        </div>
      </Link>
    );
  }
  return (
    <div>
      <Transition appear show={searchModal} as={Fragment}>
        <Dialog
          open={searchModal}
          onClose={() => setSearchModal(false)}
          className="z-20 relative"
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
            <div className="flex justify-center items-center h-full">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Panel className="bg-gray-800 rounded-md p-4 flex flex-col gap-y-4 w-1/2">
                  <InstantSearch
                    searchClient={searchClient}
                    indexName="article_name"
                  >
                    <CustomSearchBox />
                    <Hits hitComponent={Hit} />
                  </InstantSearch>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <div className="md:flex md:flex-nowrap max-h-[stretch] h-screen">
        <div className="md:hidden fixed top-0 bg-gray-800 flex items-center justify-between p-2 z-20 w-full px-5">
          <div className="text-xl font-bold text-indigo-400">PulthApp</div>
          <Link href="/api/auth/signin" className={user ? "hidden" : ""}>
            <div
              className={`${
                user ? "hidden" : "inline"
              } flex flex-row items-center text-white bg-gray-600 rounded-lg p-1 px-2`}
            >
              <ArrowLeftOnRectangleIcon
                className={`h-6 w-6 rotate-180`}
              ></ArrowLeftOnRectangleIcon>
              <p className="text-xl ">Login</p>
            </div>
          </Link>
          <Menu as="div" className={`${user ? "" : "hidden"} self-stretch`}>
            <Menu.Button className={`relative focus:outline-none w-10 h-10 `}>
              <Image
                src={user?.image || "/default_profile.jpg"}
                alt="profile"
                layout="fill"
                className="rounded-full aspect-square"
              ></Image>
            </Menu.Button>
            <Menu.Items className="absolute p-1 rounded-md translate-y-3 right-1 bg-gray-700 focus:outline-none active:outline-none">
              <Link href={"/profile"}>
                <Menu.Item>
                  <div className="p-1 text-white hover:bg-gray-800 active:bg-gray-800 cursor-pointer rounded flex items-center align-middle gap-x-1">
                    <UserCircleIcon className="h-5 w-5" />
                    <p className="max-h-fit h-fit">Profile</p>
                  </div>
                </Menu.Item>
              </Link>

              <Link href="/settings">
                <Menu.Item>
                  <div className="p-1 text-white hover:bg-gray-800 active:bg-gray-800 cursor-pointer rounded flex items-center align-middle gap-x-1">
                    <Cog8ToothIcon className="h-5 w-5"></Cog8ToothIcon>
                    <p className="max-h-fit h-fit">Settings</p>
                  </div>
                </Menu.Item>
              </Link>
              <Menu.Item>
                <div className="p-1 text-white hover:bg-gray-800 active:bg-gray-800 cursor-pointer rounded flex items-center align-middle gap-x-1">
                  <ArrowRightOnRectangleIcon className="h-5 w-5"></ArrowRightOnRectangleIcon>
                  <a className="max-h-min" onClick={() => signOut()}>
                    Logout
                  </a>
                </div>
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
        <div className="md:hidden z-20 fixed flex bottom-0 bg-gray-800 p-5 py-3 w-full text-white/50 justify-between items-center">
          <Link href="/dashboard">
            <div
              className={`${
                router.pathname == "/dashboard" ? "text-white" : ""
              } flex flex-col items-center`}
            >
              <HomeIcon className="h-6 w-6"></HomeIcon>
              <p className="text-sm">Panel</p>
            </div>
          </Link>
          <Link href="/explore">
            <div
              className={`${router.pathname == "/explore" ? "text-white" : ""}
            flex flex-col items-center`}
            >
              <MapIcon className="h-6 w-6"></MapIcon>
              <p className="text-sm">Explore</p>
            </div>
          </Link>
          <Link href="/courses">
            <div
              className={`${router.pathname == "/courses" ? "text-white" : ""}
            flex flex-col items-center`}
            >
              <PhotoIcon className="h-6 w-6"></PhotoIcon>
              <p className="text-sm">Courses</p>
            </div>
          </Link>
          <Link href="/articles">
            <div
              className={`${router.pathname == "/articles" ? "text-white" : ""}
            flex flex-col items-center`}
            >
              <DocumentTextIcon className="h-6 w-6"></DocumentTextIcon>
              <p className="text-sm">Articles</p>
            </div>
          </Link>
        </div>

        <div className="hidden md:w-72 md:static p-4 bg-gray-800 flex-shrink-0 md:flex flex-col justify-between text-white">
          <div className="flex flex-col">
            <div className="text-3xl font-bold text-indigo-400 mb-2">
              PulthApp
            </div>
            <div className="flex flex-col gap-1">
              <Link href="/dashboard">
                <div
                  className={`${
                    router.pathname == "/dashboard"
                      ? "bg-gray-900 p-2 rounded flex items-center gap-x-3"
                      : "p-2 rounded flex items-center gap-x-3 text-white/80 "
                  } cursor-pointer`}
                >
                  <HomeIcon className="h-6 w-6"></HomeIcon> Dashboard
                </div>
              </Link>
              <Link href="/explore">
                <div
                  className={`${
                    router.pathname == "/explore"
                      ? "bg-gray-900 p-2 rounded flex items-center gap-x-3"
                      : "p-2 rounded flex items-center gap-x-3 text-white/80 "
                  } cursor-pointer`}
                >
                  <MapIcon className="h-6 w-6"></MapIcon> Explore
                </div>
              </Link>
              <Link href="/courses">
                <div
                  className={`${
                    router.pathname == "/courses"
                      ? "bg-gray-900 p-2 rounded flex items-center gap-x-3"
                      : "p-2 rounded flex items-center gap-x-3 text-white/80 "
                  } cursor-pointer`}
                >
                  <PhotoIcon className="h-6 w-6"></PhotoIcon>Courses
                </div>
              </Link>
              <Link href="/articles">
                <div
                  className={`${
                    router.pathname == "/articles"
                      ? "bg-gray-900 p-2 rounded flex items-center gap-x-3"
                      : "p-2 rounded flex items-center gap-x-3 text-white/80 "
                  } cursor-pointer`}
                >
                  <DocumentTextIcon className="h-6 w-6"></DocumentTextIcon>{" "}
                  Articles
                </div>
              </Link>
            </div>
          </div>
          <Link href="/api/auth/signin">
            <div
              className={`${
                user ? "hidden" : ""
              } bg-gray-700 flex p-3 rounded-md items-center justify-center cursor-pointer transition-all gap-x-1 duration-300 hover:bg-gray-600 hover:shadow-lg active:bg-gray-700`}
            >
              <p className="text-lg font-medium">Login</p>
              <ArrowLeftOnRectangleIcon className="h-6 w-6 rotate-180"></ArrowLeftOnRectangleIcon>
            </div>
          </Link>
          <div
            className={`${
              user ? "" : "hidden"
            } bg-gray-700 flex p-3 rounded-md gap-x-2 items-center`}
          >
            <Menu as="div">
              <Menu.Items className="absolute bg-white p-1 -translate-y-20 rounded-lg">
                <div>
                  <Link href="/settings">
                    <Menu.Item>
                      <div className="p-1 hover:bg-slate-100 active:bg-slate-200 cursor-pointer rounded text-black flex items-center align-middle gap-x-1">
                        {/* <Link href="/api/auth/signout">Logout</Link> */}
                        <Cog8ToothIcon className="h-5 w-5"></Cog8ToothIcon>
                        <p className="max-h-fit h-fit">Settings</p>
                      </div>
                    </Menu.Item>
                  </Link>
                  <Menu.Item>
                    <div className="p-1 hover:bg-slate-100 active:bg-slate-200 cursor-pointer rounded text-black flex items-center align-middle gap-x-1">
                      {/* <Link href="/api/auth/signout">Logout</Link> */}
                      <ArrowRightOnRectangleIcon className="h-5 w-5"></ArrowRightOnRectangleIcon>
                      <a className="max-h-min" onClick={() => signOut()}>
                        Logout
                      </a>
                    </div>
                  </Menu.Item>
                </div>
              </Menu.Items>
              <div className={`h-12 w-12 relative `}>
                <Menu.Button>
                  <Image
                    src={user?.image || "/default_profile.jpg"}
                    alt="profile"
                    height={64}
                    width={64}
                    className="rounded-full aspect-square"
                  ></Image>
                </Menu.Button>
              </div>
            </Menu>

            <div className="flex flex-col text-sm">
              <div className="text-base">{user?.name}</div>
              <Link href="/profile">
                <div className="cursor-pointer text-white/70 hover:text-white/90">
                  View Profile
                </div>
              </Link>
            </div>
          </div>
        </div>
        <div className="pb-16 md:pb-0 md:mb-0 md:flex-grow md:overflow-y-scroll md:pt-0 pt-16">
          <div className="bg-gray-800 w-full  flex flex-row items-center p-2">
            <button
              className="bg-gray-500 rounded-md p-0.5 focus:ring-0 focus:outline-none"
              onClick={() => setSearchModal(true)}
            >
              <MagnifyingGlassIcon className="h-8 w-8" />
            </button>
            {/* <InstantSearch searchClient={searchClient} indexName="article_name">
              <SearchBox />
              <Hits hitComponent={Hit} />
            </InstantSearch> */}
          </div>
          <AnimatePresence>
            {/* figure out on exit transition */}
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              initial={{ opacity: 0, scale: 0.95 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.075, type: "linear" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
