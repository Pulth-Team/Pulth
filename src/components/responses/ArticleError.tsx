import type { NextPage } from "next";

const ArticleNotPublished: NextPage<{ title: string; desc: string }> = ({
  title,
  desc,
}) => {
  return (
    <div>
      <h1 className="text-2xl font-medium">{title}</h1>
      <p className="">{desc}</p>
    </div>
  );
};

export default ArticleNotPublished;
