import type { NextPage } from "next";

import { trpc } from "../utils/trpc";
import Head from "next/head";
import Link from "next/link";

import { useSession } from "next-auth/react";

import DashboardLayout from "../components/layouts/dashboard";

const Dashboard: NextPage = () => {
  // const batchFetch = trpc.useQuery(["article.batch-data"]);

  const { data } = useSession();
  const user = data?.user;

  return (
    <DashboardLayout>
      <Head>
        <title>Dashboard - Pulth App</title>
        <meta
          name="description"
          content="Pulth App Dashboard where you can manage your usage of Pulth"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </DashboardLayout>
  );
};

export default Dashboard;
