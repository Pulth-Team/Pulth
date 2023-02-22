import type { NextPage } from "next";

import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";

const Tour = dynamic(() => import("../components/Tour"), { ssr: false });

import { useSession } from "next-auth/react";

import DashboardLayout from "../components/layouts/dashboard";
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
          tours={[
            {
              targetQuery: "#dashboard-menu-item",
              direction: "right",
              align: "start",
              message:
                "This is the dashboard. You can see your recommended courses and articles here",
              className: "mx-4",
            },
            {
              targetQuery: "#explore-menu-item",
              direction: "right",
              align: "start",
              message:
                "This is the explore page. You can see all the courses and articles here",
              className: "mx-4",
            },
            {
              targetQuery: "#courses-menu-item",
              direction: "right",
              align: "start",
              message:
                "This is the courses page. You can see all the courses here",
              className: "mx-4",
            },
            {
              targetQuery: "#articles-menu-item",
              direction: "right",
              align: "start",
              message:
                "This is the articles page. You can see all the articles here",
              className: "mx-4",
            },
            {
              targetQuery: "#current-account-box",
              direction: "top",
              message:
                "This is your account action box. You can click to your profile picture open the menu. Then you can navigate to your profile, settings, and logout",
              className: "-translate-y-4",
            },
            {
              targetQuery: "button#search-button",
              align: "end",
              message:
                "This is the search button. You can click to open the search bar. Then you can search for courses, articles or users here",
              className: "translate-y-4",
            },
          ]}
          className={"w-64"}
          onFinished={(e) => {
            setTour(false);
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
