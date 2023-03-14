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
      <div className="p-2 h-14 z-20 bg-gray-800 flex fixed w-full">
        <div className="text-indigo-500 text-xl font-bold mr-auto self-stretch my-auto">
          PulthApp
        </div>
        {/* search button will be here */}
        <div></div>
        {!user ? (
          <Link href="/api/auth/signin" className={""}>
            <div
              className={` flex flex-row items-center text-white bg-gray-600 rounded-lg p-1 px-2`}
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

      <div className="hidden md:flex flex-col p-2 bg-gray-800 w-72 max-h-[stretch] top-0 bottom-0 fixed pt-14">
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
      <div className="pt-14 pb-20 overflow-y-hidden md:pl-72">{children}</div>

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
const MobileBottombar = ({ path }: { path: string }) => {
  return (
    <div className="md:hidden fixed z-10 flex bottom-0 w-screen bg-gray-800 justify-evenly py-3 text-white/60">
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
