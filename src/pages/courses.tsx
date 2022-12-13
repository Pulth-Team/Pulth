import type { NextPage } from "next";

import { trpc } from "../utils/trpc";
import Head from "next/head";
import Link from "next/link";

import { useSession } from "next-auth/react";

import DashboardLayout from "../components/layouts/dashboard";

const Courses: NextPage = () => {
  // const batchFetch = trpc.useQuery(["article.batch-data"]);

  const { data } = useSession();
  const user = data?.user;

  return (
    <DashboardLayout>
      <Head>
        <title>Courses - Pulth App</title>
        <meta
          name="description"
          content="Courses you joined in Pulth. join our community to know about newest courses"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <button
        type="button"
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => {
          throw new Error("Sentry Frontend Error");
        }}
      >
        Throw error to Sentry
      </button>
    </DashboardLayout>
  );
};

export default Courses;
