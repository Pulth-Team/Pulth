// src/pages/_app.tsx
import type { AppRouter } from "../server/router";
import type { AppType } from "next/app";
import type { Session } from "next-auth";

import { withTRPC } from "@trpc/next";
import superjson from "superjson";
import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";
import Script from "next/script";

import { env } from "../env.mjs";
import Head from "next/head";

const MyApp: AppType<{ session: Session }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const isLocal = typeof process.env.VERCEL_ENV === "undefined";
  const isDevelopment = process.env.NODE_ENV === "development" && !isLocal;
  const isProduction = process.env.NODE_ENV === "production";
  const isServer = typeof window === "undefined";

  let GOOOGLE_ANALYTICS_ID;

  if (isServer) GOOOGLE_ANALYTICS_ID = env.GOOOGLE_ANALYTICS_ID;
  else GOOOGLE_ANALYTICS_ID = env.NEXT_PUBLIC_GOOOGLE_ANALYTICS_ID;

  // show analytics only in production and development (not in preview mode)
  const showAnalytics = (isProduction || isDevelopment) && GOOOGLE_ANALYTICS_ID;

  return (
    <div className="bg-white">
      <Head>
        {/* used for safari tab color */}
        <meta name="theme-color" content="#ecd96f"></meta>
      </Head>
      {showAnalytics ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${env.GOOOGLE_ANALYTICS_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${env.GOOOGLE_ANALYTICS_ID}');
        `}
          </Script>
        </>
      ) : (
        <></>
      )}
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </div>
  );
};

export const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "";
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export default withTRPC<AppRouter>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = `${getBaseUrl()}/api/trpc`;
    // for client requests
    if (typeof window !== "undefined")
      return {
        url,
        transformer: superjson,
        /**
         * @link https://react-query.tanstack.com/reference/QueryClient
         */
        // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
      };

    // during SSR below

    // optional
    // use SSG-caching for each rendered page (see caching section for more details)
    const ONE_DAY_SECONDS = 60 * 60 * 24;
    ctx?.res?.setHeader(
      "Cache-Control",
      `s-maxage=1, stale-while-revalidate=${ONE_DAY_SECONDS}`
    );

    return {
      transformer: superjson, // optional - adds superjson serialization
      url,
      /**
       * Set custom request headers on every request from tRPC
       * @link http://localhost:3000/docs/v9/header
       * @link http://localhost:3000/docs/v9/ssr
       */
      headers() {
        if (ctx?.req) {
          // To use SSR properly, you need to forward the client's headers to the server
          // This is so you can pass through things like cookies when we're server-side rendering
          // If you're using Node 18, omit the "connection" header
          const { connection: _connection, ...headers } = ctx.req.headers;
          return {
            ...headers,
            // Optional: inform server that it's an SSR request
            "x-ssr": "1",
          };
        }
        return {};
      },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: true,
})(MyApp);
