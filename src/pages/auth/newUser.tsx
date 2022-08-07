import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { getProviders, signIn, useSession } from "next-auth/react";
import { Provider } from "next-auth/providers";
import { useRouter } from "next/router";

const NewUser: NextPage = () => {
  return (
    <>
      <Head>
        <title>Hello new friend !</title>
      </Head>
      <p>Welcome to Pulth ! lets get started by creating your account.</p>
    </>
  );
};

export default NewUser;
