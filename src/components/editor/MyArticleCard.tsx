import type { NextPage } from "next";
import Link from "next/link";
interface MyArticleProps {
  slug: string;
  title: string;
  description: string;
  isPublished: boolean;
}

const MyArticleCard: NextPage<MyArticleProps> = ({
  title,
  description,
  slug,
  isPublished,
}) => {
  return (
    <Link href={!isPublished ? `/articles/${slug}/edit` : `/articles/${slug}`}>
      <div
        className={`bg-gray-100 col-span-1 group flex flex-col items-start justify-start
                       p-4 rounded-md shadow-sm hover:shadow-md min-h-[128px]
                       ${
                         !isPublished
                           ? "border-2 border-dashed bg-white border-gray-300 hover:bg-gray-100 hover:border-indigo-500"
                           : "hover:bg-indigo-500"
                       }`}
      >
        <p
          className={`text-lg font-medium  ${
            !isPublished
              ? "group-hover:text-indigo-500"
              : "group-hover:text-white"
          } `}
        >
          {title}
        </p>
        <p
          className={`line-clamp-3  ${
            !isPublished
              ? "group-hover:text-indigo-500"
              : "group-hover:text-white"
          }`}
        >
          {description}
        </p>
      </div>
    </Link>
  );
};

export default MyArticleCard;
