import type { NextPage } from "next";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

// import BatchRenderer from "../components/BatchRenderer";

import { useSession } from "next-auth/react";
import React from "react";
import {
  HomeIcon,
  MapIcon,
  PhotoIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { router } from "@trpc/server";

const Dashboard: NextPage<{ children: React.ReactNode }> = ({ children }) => {
  // const batchFetch = trpc.useQuery(["article.batch-data"]);
  const router = useRouter();
  const { data } = useSession();
  const user = data?.user;

  return (
    <>
      <div className="h-screen flex flex-nowrap">
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
          <div
            className={`${
              user ? "hidden" : ""
            } bg-gray-700 flex p-3 rounded-md gap-x-2 items-center`}
          >
            Please login to see your account credentials
          </div>
          <div
            className={`${
              user ? "" : "hidden"
            } bg-gray-700 flex p-3 rounded-md gap-x-2 items-center`}
          >
            <div className={`h-12 w-12`}>
              <Image
                src={user?.image || "/default_profile.jpg"}
                alt="profile"
                height={64}
                width={64}
                className="rounded-full aspect-square"
              ></Image>
            </div>
            <div className="flex flex-col text-sm">
              <div className="text-base">{user?.name}</div>
              <div className="cursor-pointer text-white/70 hover:text-white/90">
                View Profile
              </div>
            </div>
          </div>
        </div>
        <div className="flex-grow">{children}</div>
      </div>
    </>
  );
};

export default Dashboard;
