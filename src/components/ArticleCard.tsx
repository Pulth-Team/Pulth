import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";
// import {} from "heroicons/24/outline";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { create } from "domain";
import {
  ArrowRightCircleIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";

interface ArticleCardProps {
  Title: string;
  Topics?: string[];
  Author?: {
    Name: string;
    Title?: string;
    Image?: string;
    UserId: string;
  };
  isRecommended?: boolean;
  slug: string;
  className?: string;
  createdAt?: Date;
}

const ArticleCard: NextPage<
  ArticleCardProps & { children: React.ReactNode }
> = ({
  Title,
  Topics,
  Author,
  isRecommended,
  className,
  children,
  slug,
  createdAt,
}) => {
  dayjs.extend(relativeTime);
  console.log(Author?.Image);
  return (
    <div
      className={`${
        className || ""
      } flex flex-col bg-gray-100 gap-y-1 rounded-xl p-4 min-w-[256px] max-w-xs flex-shrink-0`}
    >
      <div className="flex justify-between whitespace-nowrap  ">
        <div className="flex gap-1">
          {isRecommended && (
            <div className="capitalize font-light text-sm text-transparent bg-clip-text bg-gradient-to-r from-[#7b4397] to-[#dc2430]">
              #recommended
            </div>
          )}
          {/* add */}
          {/* <div className="capitalize  font-light text-sm">#Javascript</div> */}
        </div>
      </div>
      <div className="flex justify-between items-baseline">
        <Link href={`/articles/${slug}`} className="cursor-pointer">
          <a className="text-xl font-semibold mb-1 line-clamp-1 ">{Title}</a>
        </Link>
        {/* <div className="whitespace-nowrap font-light text-sm flex-shrink-0">
          {dayjs(createdAt).fromNow()}
        </div> */}
      </div>
      <p className=" line-clamp-4 mb-4">{children}</p>

      <div className="mt-auto flex gap-2">
        <Link href={`/user/${Author?.UserId}`}>
          <div className="w-9 h-9 relative cursor-pointer">
            <Image
              src={Author?.Image || "/default-profile.png"}
              alt="profile"
              height={64}
              width={64}
              className="rounded-full aspect-square"
            ></Image>
          </div>
        </Link>
        <div>
          <Link href={`/user/${Author?.UserId}`}>
            <p className="text-sm cursor-pointer">{Author?.Name}</p>
          </Link>
          <p className="text-xs text-black/70">
            {/* {Author?.Title} */}
            {dayjs(createdAt).fromNow()}
          </p>
        </div>

        {/* TODO Add more actions menu including "Dont Recommend me", "I Loved This","Cancel" */}
        <Link href={`/articles/${slug}`} className="cursor-pointer">
          <button className="ml-auto bg-indigo-500 p-1 flex gap-x-2 items-stretch rounded-md">
            <p className="text-white">Go to Article</p>
            <ArrowRightCircleIcon className="self-stretch w-6 stroke-white" />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ArticleCard;
