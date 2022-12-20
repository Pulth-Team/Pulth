import type { NextPage } from "next";
import React from "react";
//  import { } from "heroicons/24/outline";

interface LoadingProps {
  className?: string;
  borderWidth?: number;
}

const Loading: NextPage<LoadingProps> = ({ className }) => {
  return (
    <div
      className={`rounded-full border-t-gray-500 aspect-square  animate-spin 
      ${className || ""} `}
    ></div>
  );
};

export default Loading;
