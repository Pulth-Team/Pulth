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
    <div className="h-fit w-48 flex-shrink-0 bg-gray-100 rounded-xl flex flex-col  p-2 gap-y-1 drop-shadow mb-2">
      <h1 className="font-bold self-start">{Title}</h1>
      <p className="text-sm">{children}</p>
      {/* Maybe instead of adding tag,just write keyword i.e. "Javascript,React,Web" in the lower corner ?  */}
      {/* <div className="flex flex-wrap justify-items-start w-full gap-1">
        <div className="text-xs font-medium rounded text-white bg-gray-600 p-1">
          Next.js
        </div>
        <div className="text-xs font-medium rounded text-white bg-yellow-600 p-1">
          Javascript
        </div>
        <div className="text-xs font-medium rounded text-white bg-blue-600 p-1">
          React
        </div>
      </div> */}
      <p className="text-xs self-start italic text-black/60">
        {Topics?.join(", ")}
      </p>

      <div className="flex self-start  mt-3 gap-x-2">
        <div className="h-8 w-8 flex-grow-0 flex-shrink relative ">
          <Image
            src={Author?.Image || "/default_profile.jpg"}
            layout="fill"
            objectFit="cover"
            alt="profile"
            className="rounded-full"
          ></Image>
        </div>
        <div className="flex flex-col">
          <p className="text-xs font-semibold">{Author?.Name}</p>
          <p className="text-xs text-black/60">{Author?.Title}</p>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
