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
        <br />
        <Tour
          start={tour}
          onClosed={() => {
            setTour(false);
          }}
          className="mx-4 my-2 w-64"
          tours={[
            {
              targetQuery: "#search-button",
              message: "This is the dashboard. You can see your overall stats",
              align: "end",
            },
            {
              targetQuery: "#dashboard-menu-item",
              direction: "right",
              align: "start",
              message: "This is the dashboard. You can see your overall stats",
              skip: true,
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
            switch (e) {
              case "error":
                console.log("Error happened while Touring", {
                  message: message,
                });
                break;
              case "redirect":
                console.log("Redirecting to", message);
                break;
              case "skipped":
                console.log("Tour skipped");
                break;
              default:
                console.log("Touring finished");
                break;
            }
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
