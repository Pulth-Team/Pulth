import type { GetServerSideProps } from "next";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { getBaseUrl } from "~/utils/api";

const staticPaths = [
  "/",
  "/articles",
  "/explore",
  "/courses",
  "/dashboard",
  "/auth/signin",
];

export const generateSiteMap = (pages: { path: string }[]) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!--We manually set the two URLs we know already-->
     
     ${staticPaths
       .map((path) => {
         return `
                <url>
                    <loc>${env.DEPLOYMENT_URL + path}</loc>
                </url>
            `;
       })
       .join("")}
     ${pages
       .map(({ path }) => {
         return `
       <url>
           <loc>${env.DEPLOYMENT_URL + path}</loc>
       </url>
     `;
       })
       .join("")}
   </urlset>
 `;
};

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const articles = await prisma.article.findMany({
    where: {
      isPublished: true,
    },
    select: {
      slug: true,
    },
  });

  //const users = prisma.user.findMany({
  //  select: {
  //      id: true,
  //  },
  //});

  const pages = articles.map((article) => {
    return { path: "/articles/" + article.slug };
  });

  // We generate the XML sitemap with the posts data
  const sitemap = generateSiteMap(pages);

  res.setHeader("Content-Type", "text/xml");
  // we send the XML to the browser
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default SiteMap;
