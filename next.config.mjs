import { withSentryConfig } from "@sentry/nextjs";
await import("./src/env/server.mjs");

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

export default withSentryConfig(
  {
    reactStrictMode: true,
    images: {
      // lh3.googleusercontent.com is used for Google OAuth profile pictures
      domains: [
        "via.placeholder.com",
        "lh3.googleusercontent.com",
        "cdn.pulth.com",
      ],
    },
    sentry: {
      // Use `hidden-source-map` rather than `source-map` as the Webpack `devtool`
      // for client-side builds. (This will be the default starting in
      // `@sentry/nextjs` version 8.0.0.) See
      // https://webpack.js.org/configuration/devtool/ and
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#use-hidden-source-map
      // for more information.
      hideSourceMaps: true,
    },
  },
  sentryWebpackPluginOptions
);
