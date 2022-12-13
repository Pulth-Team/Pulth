import type { NextPage } from "next";
import Image from "next/image";
import React from "react";
// import {} from "heroicons/24/outline";

interface ArticleCardProps {
  Title: string;
  Topics?: string[];
  Author?: {
    Name: string;
    Title: string;
    Image?: string;
  };
  isRecommended?: boolean;
  className?: string;
}

const ArticleCard: NextPage<
  ArticleCardProps & { children: React.ReactNode }
> = ({ Title, Topics, Author, isRecommended, className, children }) => {
  return (
    <div
      className={`${
        className || ""
      } flex flex-col bg-gray-100 rounded-xl p-4 min-w-[256px] max-w-xs flex-shrink-0`}
    >
      <div className="flex justify-between whitespace-nowrap  ">
        <div className="flex gap-1">
          {isRecommended && (
            <div className="capitalize font-light text-sm text-transparent bg-clip-text bg-gradient-to-r from-[#7b4397] to-[#dc2430]">
              #recommended
            </div>
          )}
          <div className="capitalize  font-light text-sm">#Javascript</div>
        </div>
        <div className="whitespace-nowrap font-light text-sm flex-shrink-0">
          Aug 10
        </div>
      </div>
      <h1 className="text-lg font-medium mb-1 line-clamp-1 ">{Title}</h1>
      <p className=" line-clamp-4 mb-4">{children}</p>

      <div className="mt-auto flex gap-2">
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
          <p className="text-xs text-black/70">{Author?.Title}</p>
        </div>

        {/* TODO Add more actions menu including "Dont Recommend me", "I Loved This","Cancel" */}
        <button className="ml-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ArticleCard;
// <div className="w-64 bg-gray-100 shadow p-6 flex-shrink-0 rounded-lg flex flex-col justify-between ">
//   <div>
//     <h1 className="text-lg font-medium pb-2 line-clamp-1">{Title}</h1>
//     <p className="text-black/70 line-clamp-4">{children}</p>
//   </div>
//   <div className="">
//     <div className="flex gap-2 pt-3">
//       <div className="w-9 h-9 relative">
//         <Image
//           src={"/default_profile.jpg"}
//           alt="profile"
//           height={64}
//           width={64}
//           className="rounded-full aspect-square"
//         ></Image>
//       </div>
//       <div>
//         <p className="text-sm">{Author?.Name}</p>
//         <p className="text-xs">{Author?.Title}</p>
//       </div>
//     </div>
//     <p className="text-xs mt-2 text-black/70">5 minutes read</p>
//   </div>
// </div>
