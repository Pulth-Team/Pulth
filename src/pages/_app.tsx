import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

import "~/styles/globals.css";

import Script from "next/script";
import { env } from "~/env.mjs";
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
  console.log("showAnalytics", showAnalytics, {
    isProduction,
    isDevelopment,
    GOOOGLE_ANALYTICS_ID,
  });

  return (
    <div className="bg-white">
      <Head>
        {/* used for safari tab color */}
        <meta name="theme-color" content="#1F2937"></meta>
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

export default api.withTRPC(MyApp);
