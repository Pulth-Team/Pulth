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
    <Link
      // href={`/articles/${slug}/inspect`}
      href={{
        pathname: `/articles/[slug]/inspect`,
        query: { slug: slug },
      }}
    >
      <div
        className={`group col-span-1 flex min-h-[128px] flex-col items-start justify-start
                       rounded-md bg-gray-100 p-4 shadow-sm hover:shadow-md
                       ${
                         !isPublished
                           ? "border-2 border-dashed border-gray-300 bg-white hover:border-indigo-500 hover:bg-gray-100"
                           : "border border-gray-200 hover:border-none hover:bg-indigo-500"
                       } h-full`}
      >
        <p
          className={`inline-block w-full truncate break-all text-lg font-medium  ${
            !isPublished
              ? "group-hover:text-indigo-500"
              : "group-hover:text-white"
          } line-clamp-1`}
        >
          {title}
        </p>
        <p
          className={`line-clamp-3 w-full break-all   ${
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
