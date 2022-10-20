import type { NextPage } from "next";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

import { Menu } from "@headlessui/react";

import { Session } from "next-auth";
import { signOut } from "next-auth/react";

import { useRouter } from "next/router";

// import BatchRenderer from "../components/BatchRenderer";

import { useSession } from "next-auth/react";
import React from "react";
import {
  HomeIcon,
  MapIcon,
  PhotoIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  Cog8ToothIcon,
} from "@heroicons/react/24/outline";
import { router } from "@trpc/server";

const Dashboard: NextPage<{ children: React.ReactNode }> = ({ children }) => {
  // const batchFetch = trpc.useQuery(["article.batch-data"]);
  const router = useRouter();
  const { data } = useSession();
  const user = data?.user;
  //
  return (
    <>
      <div className="flex flex-nowrap top-[env(titlebar-area-height)] spcScreen">
        <div className="sm:w-72 p-4 bg-gray-800 flex-shrink-0 flex flex-col justify-between text-white">
          <div className="flex flex-col">
            <div className="h-16 text-xl font-bold text-indigo-400">Pulth</div>
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
              <div className={`h-12 w-12 relative`}>
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
              <div className="cursor-pointer text-white/70 hover:text-white/90">
                View Profile
              </div>
            </div>
          </div>
        </div>
        <div className="flex-grow overflow-y-scroll p-2">{children}</div>
      </div>
    </>
  );
};

export default Dashboard;
