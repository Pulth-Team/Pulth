import type { NextPage } from "next";

import { trpc } from "../utils/trpc";
import Head from "next/head";
import Link from "next/link";

import { useSession } from "next-auth/react";

import DashboardLayout from "../components/layouts/dashboard";

const Articles: NextPage = () => {
  const { data } = useSession();
  const user = data?.user;

  return (
    <DashboardLayout>
      <Head>
        <title>Articles - Pulth App</title>
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
