import type { NextPage } from "next";

import Head from "next/head";
import Link from "next/link";

import { useSession } from "next-auth/react";

import DashboardLayout from "~/components/layouts/gridDashboard";

// load editor only on client side
import dynamic from "next/dynamic";
const Editor = dynamic(() => import("~/components/editor/Editor"), {
  ssr: false,
});

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
            className="w-32 h-32 flex-shrink-0 bg-gray-100"
            key={index}
          ></div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Articles;
