import type { NextPage } from "next";
import { Fragment, ReactNode, useState } from "react";

import { twMerge } from "tailwind-merge";

import Link from "next/link";
import { useRouter } from "next/router";
import { Dialog, Menu, Transition } from "@headlessui/react";
import Image from "next/legacy/image";
import { signOut, useSession } from "next-auth/react";

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

import { env } from "~/env.mjs";

// i guess i lost my sanity
import Div100vh from "react-div-100vh";
import SearchModal from "../SearchModal";

const GridDashboard: NextPage<{
  children: ReactNode;
  contentClassName?: string;
}> = ({ children, contentClassName }) => {
  const { data: userData, status: userStatus } = useSession();
  const router = useRouter();

  const [searchModal, setSearchModal] = useState(false);

  return (
    <>
      <Div100vh className="grid h-[stretch] grid-rows-dashboard-mobile md:grid-cols-dashboard-desktop md:grid-rows-dashboard-desktop">
        <aside className="row-start-3 flex flex-col bg-gray-800 md:row-span-2">
          <div className=" mb-6 hidden flex-row items-center gap-2 rounded-md bg-gray-800 p-4 text-gray-400 md:flex">
            <span className="text-xl font-bold text-indigo-500">PulthApp</span>
          </div>
          <nav className="flex h-full flex-row items-center justify-evenly px-2 md:h-auto  md:flex-col md:items-stretch md:justify-start">
            {menuItems.map((item) => (
              <MenuItem
                key={item.name}
                icon={<item.icon className="h-6 w-6" />}
                text={item.name}
                path={item.path}
                id={item.id}
                currentPath={router.pathname}
                className="flex-grow"
              />
            ))}
          </nav>
          {userData?.user ? (
            <AccountBox
              className="m-2 hidden md:flex"
              image={userData?.user?.image!}
              name={userData?.user?.name!}
              path={router.pathname}
              id={userData?.user?.id!}
            />
          ) : (
            <div className="m-2 mt-auto hidden md:block ">
              <Link href="/api/auth/signin">
                <button className="flex w-full rounded-md bg-gray-700 p-2 ">
                  <p className="flex h-12 w-full items-center justify-center text-center font-semibold text-gray-200 ">
                    Login
                  </p>
                </button>
              </Link>
            </div>
          )}
        </aside>
        <header className="row-start-1 flex h-14 items-center bg-gray-800 p-2 md:row-span-1 ">
          <div className="my-auto self-stretch px-2 text-xl font-bold text-indigo-500 md:hidden">
            <span className="text-xl font-bold text-indigo-500">PulthApp</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {userStatus !== "authenticated" ? (
              <Link href="/api/auth/signin">
                <button className="m-2 flex rounded-md bg-gray-700 p-2">
                  <p className="flex items-center justify-center text-center font-semibold text-gray-200 ">
                    Login
                  </p>
                </button>
              </Link>
            ) : (
              ""
            )}
            <button
              className={`ml-auto flex flex-row items-center gap-2 rounded-lg bg-gray-600 p-2 text-white hover:bg-gray-500 active:bg-gray-700 `}
              id="search-button"
              onClick={() => {
                setSearchModal(true);
              }}
            >
              <MagnifyingGlassIcon className={`h-6 w-6`}></MagnifyingGlassIcon>
              <p className="sr-only">Search</p>
            </button>

            <div>
              {userData?.user?.image ? (
                <MobilePhoto
                  image={userData?.user?.image ?? "/default_profile.jpg"}
                />
              ) : (
                ""
              )}
            </div>
          </div>
        </header>
        <main
          className={twMerge(
            "col-span-1 min-h-full overflow-auto bg-white",
            contentClassName
          )}
        >
          {children}
        </main>

        <SearchModal isOpen={searchModal} setOpen={setSearchModal} />
      </Div100vh>
    </>
  );
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

export default GridDashboard;

const MenuItem = ({
  icon,
  text,
  path,
  currentPath,
  id,
  className,
}: {
  icon: React.ReactNode;
  text: string;
  path: string;
  currentPath: string;
  id: string;
  className?: string;
}) => {
  return (
    <Link href={path}>
      <div
        id={id}
        className={twMerge(
          "flex cursor-pointer flex-col  items-center rounded-md bg-transparent p-2 md:flex-row md:gap-2 md:self-stretch",
          currentPath === path
            ? "text-white md:bg-gray-700"
            : "bg-gray-800 text-gray-400",
          className
        )}
      >
        {icon}
        <p className="text-sm md:text-base">{text}</p>
      </div>
    </Link>
  );
};
const AccountBox = ({
  image,
  name,
  path,
  id,
  className,
}: {
  image: string;
  name: string;
  path: string;
  id: string;
  className?: string;
}) => {
  return (
    <div
      className={twMerge(
        "flex",
        className,
        "mt-auto rounded-md bg-gray-700 p-2 "
      )}
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
        <Link
          //href={`/user/${id}`}
          href={{
            pathname: `/user/[id]`,
            query: { id: id },
          }}
        >
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
const MobilePhoto = ({ image }: { image: string }) => {
  return (
    <Menu as="div" className={`self-stretch md:hidden`}>
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
