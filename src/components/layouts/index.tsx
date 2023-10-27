import {
  DocumentTextIcon as DocumentTextIconOutline,
  HomeIcon as HomeIconOutline,
  MapIcon as MapIconOutline,
  PhotoIcon as PhotoIconOutline,
} from "@heroicons/react/24/outline";

import {
  DocumentTextIcon as DocumentTextIconSolid,
  HomeIcon as HomeIconSolid,
  MapIcon as MapIconSolid,
  PhotoIcon as PhotoIconSolid,
} from "@heroicons/react/24/solid";

import { useSession } from "next-auth/react";

import Link from "next/link";
import type { ReactNode } from "react";
import MobileAccountBox from "./components/MobileAccountBox";
import Search from "./components/Search";
import { useRouter } from "next/router";
import AccountBox from "./components/AccountBox";

type DashboardProps = {
  children: ReactNode;
  contentClassName?: string;
};

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    id: "dashboard-menu-item",
    icon: {
      outline: HomeIconOutline,
      solid: HomeIconSolid,
    },
  },
  {
    name: "Explore",
    path: "/explore",
    id: "explore-menu-item",
    icon: {
      outline: MapIconOutline,
      solid: MapIconSolid,
    },
  },
  {
    name: "Courses",
    path: "/courses",
    id: "courses-menu-item",
    icon: {
      outline: PhotoIconOutline,
      solid: PhotoIconSolid,
    },
  },
  {
    name: "Articles",
    path: "/articles",
    id: "articles-menu-item",
    icon: {
      outline: DocumentTextIconOutline,
      solid: DocumentTextIconSolid,
    },
  },
];

const FixedDashboardLayout = ({ children }: DashboardProps) => {
  const { data: userData, status: userStatus } = useSession();
  const { pathname: currentPath } = useRouter();

  return (
    <div className=" bg-gray-800">
      <header className="fixed inset-x-0 flex justify-between bg-gray-800 p-2">
        <Link href="/" className="px-2 py-1">
          <span className="text-xl font-bold text-indigo-500">PulthApp</span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          {userStatus !== "authenticated" && (
            <Link href="/api/auth/signin">
              <button className="flex rounded-md bg-gray-700 p-2 md:hidden">
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

      <div className="flex min-h-[calc(100dvh-72px)] flex-col md:min-h-[calc(100dvh)]">
        <main className="max-w-screen mb-[72px] mt-14 min-h-[calc(100dvh-128px)] flex-grow self-stretch overflow-x-auto bg-white md:mb-0 md:ml-[clamp(256px,20vw,288px)] md:min-h-[calc(100dvh-56px)] ">
          {children}
        </main>
        <div className="fixed inset-x-0 bottom-0 md:right-[calc(100vw-clamp(256px,20vw,288px))] md:top-14 md:max-w-[clamp(256px,20vw,288px)]">
          <nav className="flex justify-evenly bg-gray-800 px-2 py-1.5 md:h-full md:flex-col md:justify-start md:p-2">
            {menuItems.map((item) => {
              const Icon = item.icon.outline;
              const IconSolid = item.icon.solid;

              const isCurrentPath = item.path === currentPath;

              return (
                <Link
                  href={item.path}
                  key={item.id}
                  id={item.id}
                  className={`flex flex-col items-center justify-center rounded-md p-2 md:flex-row md:justify-start md:gap-2 ${
                    isCurrentPath ? "bg-gray-700" : ""
                  }`}
                  //md:self-stretch bg-gray-800 text-white md:bg-gray-700 flex-grow
                >
                  {isCurrentPath ? (
                    <IconSolid className="h-6 w-6 fill-white stroke-white" />
                  ) : (
                    <Icon className="h-6 w-6  text-gray-400" />
                  )}
                  <span
                    className={`text-sm md:text-base ${
                      isCurrentPath ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
            {userData?.user ? (
              <AccountBox
                className="hidden md:flex"
                image={userData?.user?.image!}
                name={userData?.user?.name!}
                path={currentPath}
                id={userData?.user?.id!}
              />
            ) : (
              <div className="mt-auto hidden md:block ">
                <Link href="/api/auth/signin">
                  <button className="flex w-full rounded-md bg-gray-700 p-2 ">
                    <p className="flex h-12 w-full items-center justify-center text-center font-semibold text-gray-200">
                      Login
                    </p>
                  </button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default FixedDashboardLayout;
