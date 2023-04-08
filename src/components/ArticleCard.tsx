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
  return (
    <div
      className={`${
        className || ""
      } flex min-w-[256px] max-w-xs flex-shrink-0 flex-col gap-y-1 rounded-xl bg-gray-100 p-4`}
    >
      <div className="flex justify-between whitespace-nowrap  ">
        <div className="flex gap-1">
          {isRecommended && (
            <div className="bg-gradient-to-r from-[#7b4397] to-[#dc2430] bg-clip-text text-sm font-light capitalize text-transparent">
              #recommended
            </div>
          )}
          {/* add */}
          {/* <div className="capitalize  font-light text-sm">#Javascript</div> */}
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <Link
          // href={`/articles/${slug}`}
          href={{
            pathname: `/articles/[slug]`,
            query: { slug: slug },
          }}
          className="mb-1 cursor-pointer text-xl font-semibold line-clamp-1 "
        >
          {Title}
        </Link>
        {/* <div className="whitespace-nowrap font-light text-sm flex-shrink-0">
          {dayjs(createdAt).fromNow()}
        </div> */}
      </div>
      <p className=" mb-4 line-clamp-4">{children}</p>

      <div className="mt-auto flex gap-2">
        <Link
          // href={`/user/${Author?.UserId}`}
          href={{
            pathname: `/user/[userId]`,
            query: { userId: Author?.UserId },
          }}
        >
          <div className="relative h-9 w-9 cursor-pointer">
            <Image
              src={Author?.Image || "/default-profile.png"}
              alt="profile"
              height={64}
              width={64}
              className="aspect-square rounded-full"
            ></Image>
          </div>
        </Link>
        <div>
          <Link
            // href={`/user/${Author?.UserId}`}
            href={{
              pathname: `/user/[userId]`,
              query: { userId: Author?.UserId },
            }}
          >
            <p className="cursor-pointer text-sm">{Author?.Name}</p>
          </Link>
          <p className="text-xs text-black/70">
            {/* {Author?.Title} */}
            {dayjs(createdAt).fromNow()}
          </p>
        </div>

        {/* TODO Add more actions menu including "Dont Recommend me", "I Loved This","Cancel" */}
        <Link
          // href={`/articles/${slug}`}
          href={{
            pathname: `/articles/[slug]`,
            query: { slug: slug },
          }}
          className="cursor-pointer"
        >
          <button className="ml-auto flex items-stretch gap-x-2 rounded-md bg-indigo-500 p-1">
            <p className="text-white">Go to Article</p>
            <ArrowRightCircleIcon className="w-6 self-stretch stroke-white" />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ArticleCard;
