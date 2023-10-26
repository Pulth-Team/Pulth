import type { NextPage } from "next";
import DashboardLayout from "~/components/layouts";

import Head from "next/head";
import { useSession } from "next-auth/react";

const Articles: NextPage = () => {
  const { data } = useSession();
  const user = data?.user;
  const art = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
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
      aa
      <br />
      <div className="flex gap-2 ">
        {art.map((a, index) => (
          <div
            className="h-32 w-32 flex-shrink-0 bg-gray-100"
            key={index}
          ></div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Articles;
