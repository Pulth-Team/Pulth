import type { NextPage } from "next";

import Head from "next/head";
import { useSession } from "next-auth/react";

import DashboardLayout from "~/components/layouts";

const Courses: NextPage = () => {
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
    </DashboardLayout>
  );
};

export default Courses;
