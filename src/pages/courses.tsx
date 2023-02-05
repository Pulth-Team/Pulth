import type { NextPage } from "next";

import Head from "next/head";
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
          throw new Error("Not-Sentry Frontend Error");
        }}
      >
        Throw error to nothing there is no sentry
      </button>
    </DashboardLayout>
  );
};

export default Courses;
