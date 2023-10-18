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

import MobileAccountBox from "./components/MobileAccountBox";
import AccountBox from "./components/AccountBox";
import Search from "./components/Search";

// i guess i lost my sanity
import Div100vh from "react-div-100vh";

const GridDashboard: NextPage<{
  children: ReactNode;
  contentClassName?: string;
}> = ({ children, contentClassName }) => {
  const { data: userData, status: userStatus } = useSession();
  const router = useRouter();

  return (
    <>
      <Div100vh className="grid h-[stretch] grid-rows-dashboard-mobile md:grid-cols-dashboard-desktop md:grid-rows-dashboard-desktop">
        <aside
          className="row-start-3 flex flex-col bg-gray-800 md:row-span-2"
          id="dashboard-sidebar"
        >
          <div className="  hidden flex-row items-center gap-2 rounded-md bg-gray-800 p-4 text-gray-400 md:flex">
            {/* Desktop PulthApp (also link) */}
            <Link href="/">
              <span className="text-xl font-bold text-indigo-500">
                PulthApp
              </span>
            </Link>
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
                  <p className="flex h-12 w-full items-center justify-center text-center font-semibold text-gray-200">
                    Login
                  </p>
                </button>
              </Link>
            </div>
          )}
        </aside>
        <header className="row-start-1 flex h-14 items-center bg-gray-800 p-2 md:row-span-1 ">
          <div className="my-auto self-stretch px-2 text-xl font-bold text-indigo-500 md:hidden">
            {/* Mobile PulthApp (also link) */}
            <Link href="/">
              <span className="text-xl font-bold text-indigo-500">
                PulthApp
              </span>
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {userStatus !== "authenticated" && (
              <Link href="/api/auth/signin">
                <button className="m-2 flex rounded-md bg-gray-700 p-2 md:hidden">
                  <p className="flex items-center justify-center text-center font-semibold text-gray-200 ">
                    Login
                  </p>
                </button>
              </Link>
            )}
            <Search />
            {userStatus == "authenticated" && (
              <MobileAccountBox
                image={userData?.user?.image ?? "/default_profile.jpg"}
              />
            )}
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
          "flex cursor-pointer flex-col  items-center rounded-md p-2 md:flex-row md:gap-2 md:self-stretch",
          currentPath === path
            ? "bg-gray-800 text-white md:bg-gray-700"
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
