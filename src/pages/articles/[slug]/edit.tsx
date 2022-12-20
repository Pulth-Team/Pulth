import type { NextPage } from "next";

import { trpc } from "../../../utils/trpc";
import Head from "next/head";
import Link from "next/link";

import { useSession } from "next-auth/react";

import DashboardLayout from "../../../components/layouts/dashboard";

// load editor only on client side
import dynamic from "next/dynamic";
const Editor = dynamic(() => import("../../../components/Editor"), {
  ssr: false,
});

const Articles: NextPage = () => {
  const { data } = useSession();
  const user = data?.user;

  return (
    <DashboardLayout>
      <Head>
        {/* Add Article name here */}
        <title>Edit Article - Pulth App</title>
        <meta
          name="description"
          content="articles dor your usage of pulth. join our community now!"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </DashboardLayout>
  );
};

export default Articles;
