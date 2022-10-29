import type { NextPage } from "next";
import Image from "next/image";
import React from "react";

interface ArticleCardProps {
  Title: string;
  Topics?: string[];
  Author?: {
    Name: string;
    Title: string;
    Image?: string;
  };
}

const ArticleCard: NextPage<
  ArticleCardProps & { children: React.ReactNode }
> = ({ Title, Topics, Author, children }) => {
  return (
    <div className="w-64 bg-gray-100 shadow p-6 flex-shrink-0 rounded-lg flex flex-col justify-between ">
      <div>
        <h1 className="text-lg font-medium pb-2 line-clamp-1">{Title}</h1>
        <p className="text-black/70 line-clamp-4">{children}</p>
      </div>
      <div className="">
        <div className="flex gap-2 pt-3">
          <div className="w-9 h-9 relative">
            <Image
              src={"/default_profile.jpg"}
              alt="profile"
              height={64}
              width={64}
              className="rounded-full aspect-square"
            ></Image>
          </div>
          <div>
            <p className="text-sm">{Author?.Name}</p>
            <p className="text-xs">{Author?.Title}</p>
          </div>
        </div>
        <p className="text-xs mt-2 text-black/70">5 minutes read</p>
      </div>
    </div>
  );
};

export default ArticleCard;
