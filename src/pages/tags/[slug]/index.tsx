import { useRouter } from "next/router";
import Head from "next/head";
import ArticleCard from "~/components/ArticleCard";
import Dashboard from "~/components/layouts";
import { api } from "~/utils/api";
import { GetStaticPaths, GetStaticPropsContext } from "next/types";
import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { createInnerTRPCContext } from "~/server/api/trpc";

import superjson from "superjson";

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
        <title>&quot;{tagTitle}&quot; tag on Pulth </title>
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

export async function getStaticProps(
  context: GetStaticPropsContext<{ slug: string }>
) {
  const slug = context.params?.slug;

  if (!slug) {
    return {
      notFound: true,
    };
  }

  console.log("slug", slug);

  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: null, req: null, res: null }),
    transformer: superjson, // optional - adds superjson serialization
  });

  // prefetch `tag.searchArticlesByTag`
  const articles = await helpers.tag.searchArticlesByTag.fetch({
    tagSlug: slug,
  });

  if (articles.length == 0)
    return {
      notFound: true,
    };

  return {
    revalidate: 60 * 60,
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  const tags = await prisma.tag.findMany({
    select: {
      slug: true,
    },
  });

  const paths = tags.map((tag) => ({
    params: { slug: tag.slug },
  }));

  return {
    paths: paths,
    // https://nextjs.org/docs/pages/api-reference/functions/get-static-paths#fallback-blocking
    fallback: "blocking",
  };
};

export default TagSlugPage;
