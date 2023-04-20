import type { NextPage } from "next";

import Head from "next/head";
import Link from "next/link";

import dynamic from "next/dynamic";
const Tour = dynamic(() => import("~/components/Tour"), { ssr: false });

import { useSession } from "next-auth/react";

import DashboardLayout from "~/components/layouts/gridDashboard";
import { useState } from "react";

const Dashboard: NextPage = () => {
  const { data } = useSession();

  const [tour, setTour] = useState(false);

  const showTour = () => {
    console.log("show tour");
    setTour(true);
  };

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
      <div className="p-4">
        <button onClick={showTour}>start Tour</button>
        <Tour
          start={tour}
          className="mx-4 w-64"
          tours={[
            {
              targetQuery: "#dashboard-sidebar",
              direction: "right",
              message:
                "This is the sidebar. You can navigate to different pages from here and you can also see your profile here",
            },
            {
              targetQuery: "#dashboard-menu-item",
              direction: "right",
              align: "start",
              message: "This is the dashboard. You can see your overall stats",
            },
            {
              targetQuery: "#explore-menu-item",
              direction: "right",
              align: "start",
              message: "This is the explore page. Let's go there !",
              redirect: "/explore",
            },
          ]}
          onFinished={(e, message) => {
            setTour(false);
            if (e === "error")
              console.log("Error happened while Touring", {
                message: message,
              });
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
