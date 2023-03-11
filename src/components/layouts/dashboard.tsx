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
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

import { motion, AnimatePresence } from "framer-motion";
import algoliasearch from "algoliasearch/lite";
import {
  SearchBox,
  InstantSearch,
  RefinementList,
  Hits,
} from "react-instantsearch-dom";

import { env } from "../../env.mjs";

const Dashboard: NextPage<{ children: React.ReactNode }> = ({ children }) => {
  const { data } = useSession();
  const user = data?.user;
  const router = useRouter();

  const [searchModal, setSearchModal] = useState(false);

  const searchClient = algoliasearch(
    env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    env.NEXT_PUBLIC_ALGOLIA_API_KEY
  );
  const onSearchClick = () => {
    setSearchModal(true);
  };
  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      id: "dashboard-menu-item",
      icon: HomeIcon,
    },
    {
      name: "Explore",
      path: "/explore",
      id: "explore-menu-item",
      icon: MapIcon,
    },
    {
      name: "Courses",
      path: "/courses",
      id: "courses-menu-item",
      icon: PhotoIcon,
    },
    {
      name: "Articles",
      path: "/articles",
      id: "articles-menu-item",
      icon: DocumentTextIcon,
    },
  ];
  function Hit({ hit }: { hit: any }) {
    return (
      <Link href={`/articles/${hit.slug}`}>
        <div
          className="bg-slate-700/30 hover:bg-indigo-900/70 p-1.5 rounded-md mb-2 cursor-pointer flex flex-row justify-between items-center"
          onClick={() => setSearchModal(false)}
        >
          <div className="flex flex-col gap-y-2">
            <p className="text-lg md:text-xl line-clamp-1 text-white font-bold">
              {hit.title}
            </p>
            <p className="text-gray-400 italic text-sm line-clamp-2 md:line-clamp-1 font-semibold">
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
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed flex w-screen bg-gray-800 p-2  gap-2  z-20">
        <span className="text-indigo-500 text-xl font-bold mr-auto self-stretch my-auto">
          PulthApp
        </span>

        <SearchButton onClick={onSearchClick} />
        {!user ? (
          <MobileLogin className="" />
        ) : (
          <MobilePhoto image={user.image ?? "/default_profile.jpg"} />
        )}
      </div>
      {/* Mobile Content */}
      <div className="pt-14 pb-20 md:hidden overflow-y-hidden">{children}</div>

      {/* Mobile Bottom Bar */}
      <MobileBottombar path={router.pathname} />

      {/* Laptop Sidebar */}
      <div className="hidden md:flex ">
        <div
          className="flex flex-col flex-shrink-0 p-2 bg-gray-800 w-72 max-h-[stretch] top-0 bottom-0"
          id="dashboard-sidebar"
        >
          <div className="flex flex-row items-center gap-2 p-2 rounded-md cursor-pointer bg-gray-800 text-gray-400 mb-8">
            <span className="text-indigo-500 text-xl font-bold">PulthApp</span>
          </div>

          {menuItems.map((item) => (
            <MenuItem
              key={item.name}
              icon={<item.icon className="w-6 h-6" />}
              text={item.name}
              path={item.path}
              id={item.id}
              currentPath={router.pathname}
            />
          ))}

          {/* Feedback Component Add feedback Modal later */}
          {/* <div className="mt-auto mb-2 ">
            <div className="flex flex-row items-center gap-2 p-2 rounded-md cursor-pointer bg-gray-800 text-gray-400">
              <QuestionMarkCircleIcon className="w-6 h-6" />
              <p>Feedback</p>
            </div>
          </div> */}

          {/* Account Component */}
          {user ? (
            <AccountBox
              image={user?.image!}
              name={user?.name!}
              path={router.pathname}
              id={user?.id!}
            />
          ) : (
            <div className="mt-auto">
              <Link href="/api/auth/signin">
                <button className="p-2 bg-gray-700 flex rounded-md w-full ">
                  <p className="text-gray-200 font-semibold w-full text-center h-12 flex justify-center items-center ">
                    Login
                  </p>
                </button>
              </Link>
            </div>
          )}
        </div>
        {/* Laptop Top Bar */}
        {/* the horizontal overflow solution  */}
        {/* https://stackoverflow.com/questions/36230944/prevent-flex-items-from-overflowing-a-container */}
        <div className="flex flex-col  flex-grow max-h-[stretch] h-screen min-w-0 ">
          <div className="flex  bg-gray-800 p-2  gap-2 flex-shrink-0 top-0 text-white  ">
            <SearchButton onClick={onSearchClick} className="ml-auto" />
          </div>
          {/* Laptop Content */}
          <div className="overflow-scroll h-full  ">{children}</div>
        </div>
      </div>

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
                <Dialog.Panel className="bg-gray-800 rounded-md p-4 flex flex-col gap-y-4 md:w-1/2 w-11/12">
                  <InstantSearch
                    searchClient={searchClient}
                    indexName={env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME}
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
    </div>
  );
};

export default Dashboard;

const AccountBox = ({
  image,
  name,
  path,
  id,
}: {
  image: string;
  name: string;
  path: string;
  id: string;
}) => {
  return (
    <div
      className="p-2 bg-gray-700 flex rounded-md mt-auto"
      id="current-account-box"
    >
      <Menu>
        <Menu.Button className="relative w-12 h-12 rounded-full overflow-hidden">
          <Image
            src={image || "/default_profile.jpg"}
            layout="fill"
            className="rounded-full"
            alt="Profile Picture"
          />
        </Menu.Button>
        <Menu.Items
          className={`absolute p-1 rounded-md bottom-0 -translate-y-20 bg-gray-700 `}
        >
          <Menu.Item>
            <div>
              <Link href="/profile">
                <a
                  className={`${
                    path === "/profile" ? "bg-gray-600" : "bg-gray-700"
                  } flex flex-row items-center gap-2 p-2 rounded-md cursor-pointer  text-gray-100`}
                >
                  <UserCircleIcon className="w-6 h-6" />
                  <p>Profile</p>
                </a>
              </Link>
            </div>
          </Menu.Item>
          <Menu.Item>
            <div>
              <Link href="/settings">
                <a
                  className={`${
                    path === "/settings" ? "bg-gray-600" : "bg-gray-700"
                  } flex flex-row items-center gap-2 p-2 rounded-md cursor-pointer  text-gray-100`}
                >
                  <Cog8ToothIcon className="w-6 h-6" />
                  <p>Settings</p>
                </a>
              </Link>
            </div>
          </Menu.Item>

          <Menu.Item>
            <a
              onClick={() => signOut()}
              className={` flex flex-row items-center gap-2 p-2 rounded-md cursor-pointer  text-gray-100`}
            >
              <ArrowLeftOnRectangleIcon className="w-6 h-6" />
              <p>Logout</p>
            </a>
          </Menu.Item>
        </Menu.Items>
      </Menu>
      <div className="flex flex-col ml-2">
        <p className="text-gray-200 font-semibold">{name}</p>
        <Link href={`/user/${id}`}>
          <button
            className="text-gray-400 text-sm text-left hover:text-gray-100"
            id="view-profile-btn"
          >
            View Profile
          </button>
        </Link>
      </div>
    </div>
  );
};

const MenuItem = ({
  icon,
  text,
  path,
  currentPath,
  id,
}: {
  icon: React.ReactNode;
  text: string;
  path: string;
  currentPath: string;
  id: string;
}) => {
  return (
    <Link href={path}>
      <div
        id={id}
        className={`flex flex-row items-center gap-2 p-2 rounded-md cursor-pointer ${
          currentPath === path
            ? "bg-gray-700 text-white"
            : "bg-gray-800 text-gray-400"
        }`}
      >
        {icon}
        <p>{text}</p>
      </div>
    </Link>
  );
};

const MobileLogin = ({ className }: { className?: string }) => {
  return (
    <Link href="/api/auth/signin" className={className ?? ""}>
      <div
        className={` flex flex-row items-center text-white bg-gray-600 rounded-lg p-1 px-2`}
      >
        <ArrowLeftOnRectangleIcon
          className={`h-6 w-6 rotate-180`}
        ></ArrowLeftOnRectangleIcon>
        <p className="text-xl ">Login</p>
      </div>
    </Link>
  );
};

const MobilePhoto = ({ image }: { image: string }) => {
  return (
    <Menu as="div" className={` self-stretch`}>
      <Menu.Button className={`relative focus:outline-none w-10 h-10 `}>
        <Image
          src={image || "/default_profile.jpg"}
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
  );
};

const SearchButton = ({
  className,
  onClick,
}: {
  className?: string;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-row items-center text-white bg-gray-600 rounded-lg p-1 px-2 gap-2 hover:bg-gray-500 active:bg-gray-700  ${
        className || ""
      } `}
      id="search-button"
    >
      <MagnifyingGlassIcon className={`h-6 w-6`}></MagnifyingGlassIcon>

      <p className="sr-only">Search</p>
    </button>
  );
};

const MobileBottombar = ({ path }: { path: string }) => {
  return (
    <div className="md:hidden fixed flex bottom-0 w-screen bg-gray-800 justify-evenly py-3 text-white/60">
      <Link href={`/dashboard`}>
        <button
          className={`flex flex-col items-center ${
            path == "/dashboard" ? "text-white" : ""
          }`}
        >
          <HomeIcon className="h-6 w-6" />
          <p>Home</p>
        </button>
      </Link>
      <Link href={`/explore`}>
        <button
          className={`flex flex-col items-center ${
            path == "/explore" ? "text-white" : ""
          }`}
        >
          <MapIcon className="h-6 w-6" />
          <p>Explore</p>
        </button>
      </Link>
      <Link href={`/courses`}>
        <button
          className={`flex flex-col items-center ${
            path == "/courses" ? "text-white" : ""
          }`}
        >
          <PhotoIcon className="h-6 w-6" />
          <p>Courses</p>
        </button>
      </Link>
      <Link href={`/articles`}>
        <button
          className={`flex flex-col items-center ${
            path == "/articles" ? "text-white" : ""
          }`}
        >
          <DocumentTextIcon className="h-6 w-6" />
          <p>Articles</p>
        </button>
      </Link>
    </div>
  );
};
