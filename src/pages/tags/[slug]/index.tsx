import { useRouter } from "next/router";
import Head from "next/head";
import ArticleCard from "~/components/ArticleCard";
import Dashboard from "~/components/layouts";
import { api } from "~/utils/api";

const TagSlugPage = () => {
  const slug = useRouter().query.slug as string;

  const articlesQuery = api.tag.searchArticlesByTag.useQuery({
    tagSlug: slug,
  });

  const tagTitle = slug
    ? slug.split("/").reduce(() => {
        return " " + slug;
      })
    : "";

  return (
    <Dashboard>
      <Head>
        <title>{tagTitle}</title>
      </Head>

      {articlesQuery.isLoading && <p>Loading...</p>}
      {articlesQuery.isError && <p>Error</p>}
      {articlesQuery.isSuccess && (
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
          {articlesQuery.data?.map((article) => (
            <ArticleCard
              key={article.id}
              Title={article.title}
              slug={article.slug}
              Author={{
                Name: article.author.name || "no name",
                UserId: article.author.id,
                Image: article.author.image ?? undefined,
              }}
              createdAt={article.createdAt}
              className="w-full max-w-none"
            >
              {article.description}
            </ArticleCard>
          ))}
        </div>
      )}
    </Dashboard>
  );
};

export default TagSlugPage;
