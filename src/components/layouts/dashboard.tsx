import type { NextPage } from "next";

import Link from "next/link";
import Image from "next/image";

import { Dialog, Menu, Transition } from "@headlessui/react";

import { signOut } from "next-auth/react";
import { useRouter } from "next/router";

import CustomSearchBox from "~/components/CustomSearchBox";

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

import { env } from "~/env.mjs";

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
          className="mb-2 flex cursor-pointer flex-row items-center justify-between rounded-md bg-slate-700/30 p-1.5 hover:bg-indigo-900/70"
          onClick={() => setSearchModal(false)}
        >
          <div className="flex flex-col gap-y-2">
            <p className="text-lg font-bold text-white line-clamp-1 md:text-xl">
              {hit.title}
            </p>
            <p className="text-sm font-semibold italic text-gray-400 line-clamp-2 md:line-clamp-1">
              {hit.description}
            </p>
            <Link href="/profile">
              <div className="flex items-center gap-x-1">
                <UserCircleIcon className="h-5 w-5 stroke-white" />
                <p className="font-semibold text-gray-400 hover:underline">
                  {hit.author}
                </p>
              </div>
            </Link>
          </div>
          <ChevronRightIcon className="h-4 w-4 flex-shrink-0 stroke-white" />
        </div>
      </Link>
    );
  }
  return (
    <div>
      {/* Mobile Top Bar */}
      <div className="fixed z-20 flex w-screen gap-2 bg-gray-800  p-2  md:hidden">
        <span className="my-auto mr-auto self-stretch text-xl font-bold text-indigo-500">
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
      <div className="overflow-y-hidden pb-20 pt-14 md:hidden">{children}</div>

      {/* Mobile Bottom Bar */}
      <MobileBottombar path={router.pathname} />

      {/* Laptop Sidebar */}
      <div className="hidden md:flex ">
        <div
          className="bottom-0 top-0 flex max-h-[stretch] w-72 flex-shrink-0 flex-col bg-gray-800 p-2"
          id="dashboard-sidebar"
        >
          <div className="mb-8 flex cursor-pointer flex-row items-center gap-2 rounded-md bg-gray-800 p-2 text-gray-400">
            <span className="text-xl font-bold text-indigo-500">PulthApp</span>
          </div>

          {menuItems.map((item) => (
            <MenuItem
              key={item.name}
              icon={<item.icon className="h-6 w-6" />}
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
                <button className="flex w-full rounded-md bg-gray-700 p-2 ">
                  <p className="flex h-12 w-full items-center justify-center text-center font-semibold text-gray-200 ">
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
        <div className="flex h-screen  max-h-[stretch] min-w-0 flex-grow flex-col ">
          <div className="top-0  flex flex-shrink-0  gap-2 bg-gray-800 p-2 text-white  ">
            <SearchButton onClick={onSearchClick} className="ml-auto" />
          </div>
          {/* Laptop Content */}
          <div className="h-full overflow-scroll  ">{children}</div>
        </div>
      </div>

      <Transition appear show={searchModal} as={Fragment}>
        <Dialog
          open={searchModal}
          onClose={() => setSearchModal(false)}
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
      className="mt-auto flex rounded-md bg-gray-700 p-2"
      id="current-account-box"
    >
      <Menu>
        <Menu.Button className="relative h-12 w-12 overflow-hidden rounded-full">
          <Image
            src={image || "/default_profile.jpg"}
            layout="fill"
            className="rounded-full"
            alt="Profile Picture"
          />
        </Menu.Button>
        <Menu.Items
          className={`absolute bottom-0 -translate-y-20 rounded-md bg-gray-700 p-1 `}
        >
          <Menu.Item>
            <div>
              <Link
                href="/profile"
                className={`${
                  path === "/profile" ? "bg-gray-600" : "bg-gray-700"
                } flex cursor-pointer flex-row items-center gap-2 rounded-md p-2  text-gray-100`}
              >
                <UserCircleIcon className="h-6 w-6" />
                <p>Profile</p>
              </Link>
            </div>
          </Menu.Item>
          <Menu.Item>
            <div>
              <Link
                href="/settings"
                className={`${
                  path === "/settings" ? "bg-gray-600" : "bg-gray-700"
                } flex cursor-pointer flex-row items-center gap-2 rounded-md p-2  text-gray-100`}
              >
                <Cog8ToothIcon className="h-6 w-6" />
                <p>Settings</p>
              </Link>
            </div>
          </Menu.Item>

          <Menu.Item>
            <a
              onClick={() => signOut()}
              className={` flex cursor-pointer flex-row items-center gap-2 rounded-md p-2  text-gray-100`}
            >
              <ArrowLeftOnRectangleIcon className="h-6 w-6" />
              <p>Logout</p>
            </a>
          </Menu.Item>
        </Menu.Items>
      </Menu>
      <div className="ml-2 flex flex-col">
        <p className="font-semibold text-gray-200">{name}</p>
        <Link href={`/user/${id}`}>
          <button
            className="text-left text-sm text-gray-400 hover:text-gray-100"
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
        className={`flex cursor-pointer flex-row items-center gap-2 rounded-md p-2 ${
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
        className={` flex flex-row items-center rounded-lg bg-gray-600 p-1 px-2 text-white`}
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
      <Menu.Button className={`relative h-10 w-10 focus:outline-none `}>
        <Image
          src={image || "/default_profile.jpg"}
          alt="profile"
          layout="fill"
          className="aspect-square rounded-full"
        ></Image>
      </Menu.Button>
      <Menu.Items className="absolute right-1 translate-y-3 rounded-md bg-gray-700 p-1 focus:outline-none active:outline-none">
        <Link href={"/profile"}>
          <Menu.Item>
            <div className="flex cursor-pointer items-center gap-x-1 rounded p-1 align-middle text-white hover:bg-gray-800 active:bg-gray-800">
              <UserCircleIcon className="h-5 w-5" />
              <p className="h-fit max-h-fit">Profile</p>
            </div>
          </Menu.Item>
        </Link>

        <Link href="/settings">
          <Menu.Item>
            <div className="flex cursor-pointer items-center gap-x-1 rounded p-1 align-middle text-white hover:bg-gray-800 active:bg-gray-800">
              <Cog8ToothIcon className="h-5 w-5"></Cog8ToothIcon>
              <p className="h-fit max-h-fit">Settings</p>
            </div>
          </Menu.Item>
        </Link>
        <Menu.Item>
          <div className="flex cursor-pointer items-center gap-x-1 rounded p-1 align-middle text-white hover:bg-gray-800 active:bg-gray-800">
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
      className={`flex flex-row items-center gap-2 rounded-lg bg-gray-600 p-1 px-2 text-white hover:bg-gray-500 active:bg-gray-700  ${
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
    <div className="fixed bottom-0 z-10 flex w-screen justify-evenly bg-gray-800 py-3 text-white/60 md:hidden">
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
