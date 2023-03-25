import type { NextPage } from "next";
import type { ReactNode } from "react";

import { twMerge } from "tailwind-merge";

import Link from "next/link";
import { useRouter } from "next/router";
import { Menu } from "@headlessui/react";
import Image from "next/image";
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
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

const GridDashboard: NextPage<{
  children: ReactNode;
  contentClassName?: string;
}> = ({ children, contentClassName }) => {
  const { data: userData, status: userStatus } = useSession();
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <>
      <div className="grid grid-rows-dashboard-mobile md:grid-cols-dashboard-desktop md:grid-rows-dashboard-desktop h-screen">
        <aside className="bg-gray-800 md:row-span-2 row-start-3 flex flex-col">
          <div className=" hidden md:flex flex-row items-center gap-2 p-4 rounded-md cursor-pointer bg-gray-800 text-gray-400 mb-6">
            <span className="text-indigo-500 text-xl font-bold">PulthApp</span>
          </div>
          <nav className="flex px-2 flex-row justify-evenly items-center h-full  md:flex-col md:justify-start md:items-start md:h-auto">
            {menuItems.map((item) => (
              <MenuItem
                key={item.name}
                icon={<item.icon className="w-6 h-6" />}
                text={item.name}
                path={item.path}
                id={item.id}
                currentPath={router.pathname}
                className=""
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
            <div className="mt-auto hidden md:block">
              <Link href="/api/auth/signin">
                <button className="p-2 bg-gray-700 flex rounded-md w-full ">
                  <p className="text-gray-200 font-semibold w-full text-center h-12 flex justify-center items-center ">
                    Login
                  </p>
                </button>
              </Link>
            </div>
          )}
        </aside>
        <header className="bg-gray-800 md:row-span-1 h-14 row-start-1 flex items-center p-2 ">
          <div className="text-indigo-500 text-xl font-bold px-2 self-stretch my-auto md:hidden">
            <span className="text-indigo-500 text-xl font-bold">PulthApp</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {userStatus !== "authenticated" ? (
              <Link href="/api/auth/signin">
                <button className="p-2 bg-gray-700 flex rounded-md m-2">
                  <p className="text-gray-200 font-semibold text-center flex justify-center items-center ">
                    Login
                  </p>
                </button>
              </Link>
            ) : (
              ""
            )}
            <button
              className={`flex flex-row items-center ml-auto text-white bg-gray-600 rounded-lg p-2 gap-2 hover:bg-gray-500 active:bg-gray-700 `}
              id="search-button"
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
            "col-span-1 overflow-auto bg-white min-h-full",
            contentClassName
          )}
        >
          {children}
        </main>
      </div>
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
          "flex bg-transparent flex-col md:flex-row items-center md:self-stretch md:gap-2 p-2 rounded-md cursor-pointer",
          currentPath === path
            ? "md:bg-gray-700 text-white"
            : "bg-gray-800 text-gray-400",
          className
        )}
      >
        {icon}
        <p>{text}</p>
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
        "p-2 bg-gray-700 rounded-md mt-auto "
      )}
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
const MobilePhoto = ({ image }: { image: string }) => {
  return (
    <Menu as="div" className={`self-stretch md:hidden`}>
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
