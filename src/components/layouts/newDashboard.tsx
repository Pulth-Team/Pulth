import type { ReactNode } from "react";
import type { NextPage } from "next";

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

// mobile Photo
import Image from "next/image";
import { Menu } from "@headlessui/react";
import { signOut } from "next-auth/react";

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

const NewDashboard: NextPage<{ children: ReactNode }> = ({ children }) => {
  const { data } = useSession();
  const user = data?.user;

  const router = useRouter();

  // TODO : add search bar

  return (
    <div className="">
      {/* Navbar */}
      <div className="fixed z-20 flex h-14 w-full bg-gray-800 p-2">
        <div className="my-auto mr-auto self-stretch text-xl font-bold text-indigo-500">
          PulthApp
        </div>
        {/* search button will be here */}
        <div></div>
        {!user ? (
          <Link href="/api/auth/signin" className={""}>
            <div
              className={` flex flex-row items-center rounded-lg bg-gray-600 p-1 px-2 text-white`}
            >
              <ArrowLeftOnRectangleIcon
                className={`h-6 w-6 rotate-180`}
              ></ArrowLeftOnRectangleIcon>
              <p className="text-xl ">Login</p>
            </div>
          </Link>
        ) : (
          <MobilePhoto image={user.image ?? "/default_profile.jpg"} />
        )}
      </div>

      <div className="fixed bottom-0 top-0 hidden max-h-[stretch] w-72 flex-col bg-gray-800 p-2 pt-14 md:flex">
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
      <div className="overflow-y-hidden pb-20 pt-14 md:pl-72">{children}</div>

      {/* mobile bottom bar (?)*/}
      <MobileBottombar path={router.pathname} />
    </div>
  );
};

export default NewDashboard;

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

// helper components
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
        <Link
          //href={`/user/${id}`}
          href={{ pathname: `/user/[userId]`, query: { userId: id } }}
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
