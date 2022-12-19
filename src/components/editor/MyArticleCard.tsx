import type { NextPage } from "next";
import Link from "next/link";
interface MyArticleProps {
  slug: string;
  title: string;
  description: string;
}

const MyArticleCard: NextPage<MyArticleProps> = ({
  title,
  description,
  slug,
}) => {
  return (
    <Link href={`/articles/${slug}`}>
      <div className="bg-gray-100 col-span-1 group flex flex-col items-start justify-start p-4 rounded-md shadow-sm hover:shadow-md hover:bg-indigo-500 min-h-[128px]">
        <p className="text-lg font-medium group-hover:text-white ">{title}</p>
        <p className="line-clamp-3 group-hover:text-white"> {description}</p>
      </div>
    </Link>
  );
};

export default MyArticleCard;
