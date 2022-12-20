import type { NextPage } from "next";
import React from "react";
//  import { } from "heroicons/24/outline";

interface LoadingProps {
  className?: string;
}

// className: tailwindcss class name
// must include w-* or h-* to set the size
// must include border-* to set the border width
//
// example: className="w-10 h-10 border-2"
const Loading: NextPage<LoadingProps> = ({ className }) => {
  return (
    <div
      className={`rounded-full border-t-gray-500 aspect-square  animate-spin 
      ${className || ""} `}
    ></div>
  );
};

export default Loading;
