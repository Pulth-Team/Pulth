import type { NextPage } from "next";

import { trpc } from "../utils/trpc";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

import { useSession } from "next-auth/react";

import DashboardLayout from "../components/layouts/dashboard";
import DragScrollContainer from "../components/DragScrollContainer";
import ArticleCard from "../components/ArticleCard";

const Articles: NextPage = () => {
  const { data } = useSession();
  const user = data?.user;

  return (
    <DashboardLayout>
      <Head>
        <title>Profile Pulth App</title>
        <meta name="description" content="Your Profile in Pulth" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="md:px-16 px-4 pt-16 pb-12 flex flex-col gap-y-4">
        <div className="md:grid grid-cols-12 gap-x-4 items-center flex">
          <div className="col-span-2 relative md:h-32">
            <Image
              src={user?.image || "/default_profile.jpg"}
              alt="profile"
              width={128}
              height={128}
              className="rounded-full"
            ></Image>
          </div>
          <div className="col-span-3 flex flex-col gap-y-2">
            <h2 className="text-base  md:text-2xl font-semibold">
              {user?.name}
            </h2>
            <p className="text-sm">Web Programmer</p>
          </div>
          <div className="md:hidden flex flex-col gap-y-3">
            <div className="flex gap-x-9">
              <div>
                <p className="text-lg font-semibold text-center">4.2k</p>
                <p className="text-xs text-center">followers</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-center">820</p>
                <p className="text-xs text-center">following</p>
              </div>
            </div>
            <div className="bg-indigo-500 cursor-pointer flex align-middle items-center gap-x-2 pl-2 rounded-md text-white text-lg font-semibold py-0.5">
              <Image
                src="/userPlus.svg"
                height={36}
                width={36}
                alt="icon"
              ></Image>
              Follow
            </div>
          </div>
          <div className="hidden md:flex col-span-2 col-start-8 gap-x-9">
            <div>
              <p className="text-lg font-semibold">4.2k</p>
              <p className="text-xs">followers</p>
            </div>
            <div>
              <p className="text-lg font-semibold">820</p>
              <p className="text-xs">following</p>
            </div>
          </div>
          <div className="bg-indigo-500 cursor-pointer hidden md:flex align-middle items-center gap-x-2 pl-2 rounded-md col-start-11 col-span-2 text-white text-lg font-semibold py-0.5">
            <Image
              src="/userPlus.svg"
              height={36}
              width={36}
              alt="icon"
            ></Image>
            Follow
          </div>
        </div>
        <p className="font-semibold">
          About <span className="text-indigo-700">{user?.name}</span>
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Porttitor
          nulla nunc, amet, in eget consequat, dui. In consectetur viverra non,
          interdum pharetra imperdiet maecenas neque. Nisl, nisl at ut dui
          turpis suspendisse suspendisse congue
        </p>
        <div className="grid md:grid-cols-2 grid-cols-1 gap-x-6 gap-y-3">
          <div className="bg-gray-100 w-full flex flex-col gap-y-3 py-3 px-2 items-center rounded-lg">
            <p className="font-semibold text-2xl">Popularity</p>
            <div className="grid grid-cols-6 justify-between gap-x-2 w-full">
              <div className="flex flex-col items-center gap-y-2 rounded-lg bg-indigo-500 p-3 col-span-2">
                <p className="text-white text-4xl font-bold">#1</p>
                <p className="text-white text-2xl font-semibold w-full text-center">
                  in Web
                </p>
              </div>
              <div className="flex flex-col items-center gap-y-2 rounded-lg bg-indigo-500 p-3 col-span-2">
                <p className="text-white text-4xl font-bold">#6</p>
                <p className="text-white text-2xl font-semibold w-full text-center">
                  in React
                </p>
              </div>
              <div className="flex flex-col items-center gap-y-2 rounded-lg bg-indigo-500 p-3 col-span-2">
                <p className="text-white text-4xl font-bold">#16</p>
                <p className="text-white text-2xl font-semibold w-full text-center">
                  in JS
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-100 w-full flex flex-col gap-y-3 py-3 px-2 items-center rounded-lg">
            <p className="font-semibold text-2xl">Statics</p>
            <div className="grid grid-cols-6 justify-between gap-x-2 w-full h-full">
              <div className="flex flex-col items-center justify-between rounded-lg bg-indigo-500 p-3 col-span-2">
                <p className="text-white text-2xl font-bold">Students</p>
                <p className="text-white text-xl font-bold w-full text-center">
                  190.215
                </p>
              </div>
              <div className="flex flex-col items-center justify-between rounded-lg bg-indigo-500 p-3 col-span-2">
                <p className="text-white text-2xl font-bold">Articles</p>
                <p className="text-white text-xl font-bold w-full text-center">
                  1.025
                </p>
              </div>
              <div className="flex flex-col items-center justify-between gap-y-2 rounded-lg bg-indigo-500 p-3 col-span-2">
                <p className="text-white text-2xl font-bold">Courses</p>
                <p className="text-white text-xl font-bold w-full text-center">
                  316
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="font-semibold">
          Recent Articles from{" "}
          <span className="text-indigo-700">{user?.name}</span>
        </p>
        <DragScrollContainer>
          <ArticleCard
            Title="Next.js Auth Errors"
            Topics={["Javascript", "Web", "React"]}
            Author={{ Title: "Web Architect", Name: "Bekir Gulestan" }}
          >
            Some article made for explaining Next Auth Errors deeply. That cover
            nearly 4 (Four) error which is nearly all(102) of them.
          </ArticleCard>
          <ArticleCard
            Title="Next.js Auth Errors"
            Topics={["Javascript", "Web", "React"]}
            Author={{ Title: "Web Architect", Name: "Bekir Gulestan" }}
          >
            Some article made for explaining Next Auth Errors deeply. That cover
            nearly 4 (Four) error which is nearly all(102) of them.
          </ArticleCard>
          <ArticleCard
            Title="Next.js Auth Errors"
            Topics={["Javascript", "Web", "React"]}
            Author={{ Title: "Web Architect", Name: "Bekir Gulestan" }}
          >
            Some article made for explaining Next Auth Errors deeply. That cover
            nearly 4 (Four) error which is nearly all(102) of them.
          </ArticleCard>
          <ArticleCard
            Title="Next.js Auth Errors"
            Topics={["Javascript", "Web", "React"]}
            Author={{ Title: "Web Architect", Name: "Bekir Gulestan" }}
          >
            Some article made for explaining Next Auth Errors deeply. That cover
            nearly 4 (Four) error which is nearly all(102) of them.
          </ArticleCard>
          <ArticleCard
            Title="Next.js Auth Errors"
            Topics={["Javascript", "Web", "React"]}
            Author={{ Title: "Web Architect", Name: "Bekir Gulestan" }}
          >
            Some article made for explaining Next Auth Errors deeply. That cover
            nearly 4 (Four) error which is nearly all(102) of them.
          </ArticleCard>
          <ArticleCard
            Title="Next.js Auth Errors"
            Topics={["Javascript", "Web", "React"]}
            Author={{ Title: "Web Architect", Name: "Bekir Gulestan" }}
          >
            Some article made for explaining Next Auth Errors deeply. That cover
            nearly 4 (Four) error which is nearly all(102) of them.
          </ArticleCard>
          <ArticleCard
            Title="Next.js Auth Errors"
            Topics={["Javascript", "Web", "React"]}
            Author={{ Title: "Web Architect", Name: "Bekir Gulestan" }}
          >
            Some article made for explaining Next Auth Errors deeply. That cover
            nearly 4 (Four) error which is nearly all(102) of them.
          </ArticleCard>
          <ArticleCard
            Title="Next.js Auth Errors"
            Topics={["Javascript", "Web", "React"]}
            Author={{ Title: "Web Architect", Name: "Bekir Gulestan" }}
          >
            Some article made for explaining Next Auth Errors deeply. That cover
            nearly 4 (Four) error which is nearly all(102) of them.
          </ArticleCard>
          <ArticleCard
            Title="Next.js Auth Errors"
            Topics={["Javascript", "Web", "React"]}
            Author={{ Title: "Web Architect", Name: "Bekir Gulestan" }}
          >
            Some article made for explaining Next Auth Errors deeply. That cover
            nearly 4 (Four) error which is nearly all(102) of them.
          </ArticleCard>
        </DragScrollContainer>
        <p className="font-semibold">
          Most popular courses from{" "}
          <span className="text-indigo-700">{user?.name}</span>
        </p>
        <DragScrollContainer>
          <ArticleCard
            Title="Next.js Auth Errors"
            Topics={["Javascript", "Web", "React"]}
            Author={{ Title: "Web Architect", Name: "Bekir Gulestan" }}
          >
            Some article made for explaining Next Auth Errors deeply. That cover
            nearly 4 (Four) error which is nearly all(102) of them.
          </ArticleCard>
          <ArticleCard
            Title="Next.js Auth Errors"
            Topics={["Javascript", "Web", "React"]}
            Author={{ Title: "Web Architect", Name: "Bekir Gulestan" }}
          >
            Some article made for explaining Next Auth Errors deeply. That cover
            nearly 4 (Four) error which is nearly all(102) of them.
          </ArticleCard>
          <ArticleCard
            Title="Next.js Auth Errors"
            Topics={["Javascript", "Web", "React"]}
            Author={{ Title: "Web Architect", Name: "Bekir Gulestan" }}
          >
            Some article made for explaining Next Auth Errors deeply. That cover
            nearly 4 (Four) error which is nearly all(102) of them.
          </ArticleCard>
          <ArticleCard
            Title="Next.js Auth Errors"
            Topics={["Javascript", "Web", "React"]}
            Author={{ Title: "Web Architect", Name: "Bekir Gulestan" }}
          >
            Some article made for explaining Next Auth Errors deeply. That cover
            nearly 4 (Four) error which is nearly all(102) of them.
          </ArticleCard>
          <ArticleCard
            Title="Next.js Auth Errors"
            Topics={["Javascript", "Web", "React"]}
            Author={{ Title: "Web Architect", Name: "Bekir Gulestan" }}
          >
            Some article made for explaining Next Auth Errors deeply. That cover
            nearly 4 (Four) error which is nearly all(102) of them.
          </ArticleCard>
          <ArticleCard
            Title="Next.js Auth Errors"
            Topics={["Javascript", "Web", "React"]}
            Author={{ Title: "Web Architect", Name: "Bekir Gulestan" }}
          >
            Some article made for explaining Next Auth Errors deeply. That cover
            nearly 4 (Four) error which is nearly all(102) of them.
          </ArticleCard>
          <ArticleCard
            Title="Next.js Auth Errors"
            Topics={["Javascript", "Web", "React"]}
            Author={{ Title: "Web Architect", Name: "Bekir Gulestan" }}
          >
            Some article made for explaining Next Auth Errors deeply. That cover
            nearly 4 (Four) error which is nearly all(102) of them.
          </ArticleCard>
        </DragScrollContainer>
      </div>
    </DashboardLayout>
  );
};

export default Articles;
