import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { getProviders, signIn, useSession } from "next-auth/react";
import { Provider } from "next-auth/providers";
import { useRouter } from "next/router";

const Error: NextPage = () => {
  return (
    <>
      <Head>
        <title>Sign In Error</title>
      </Head>
      <p>
        Error happened during sign in. Please try again or sign in with a
        different account.
      </p>
    </>
  );
};

export default Error;
