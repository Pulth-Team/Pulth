// src/pages/_app.tsx
import type { AppRouter } from "../server/router";
import type { AppType } from "next/app";

import { withTRPC } from "@trpc/next";
import superjson from "superjson";
import "../styles/globals.css";
import Script from "next/script";

import { UserProvider } from "@auth0/nextjs-auth0/client";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-D5PY4EFWHL"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-D5PY4EFWHL');
        `}
      </Script>
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
    </>
  );
};

const getBaseUrl = () => {
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

    return {
      url,
      transformer: superjson,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
})(MyApp);
