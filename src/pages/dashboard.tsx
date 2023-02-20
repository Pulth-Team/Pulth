import type { NextPage } from "next";

import { trpc } from "../utils/trpc";
import { getASTfromHTML, ValidateTree } from "../utils/editorHelpers";
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
          targetQueries={[
            "#dashboard-menu-item",
            "#explore-menu-item",
            "#courses-menu-item",
            "#articles-menu-item",
            "#current-account-box",
          ]}
          directions={["right", "right", "right", "right", "top"]}
          // TODO: add good messages
          messages={[
            "This is the dashboard. You can see your recommended courses and articles here",
            "This is the explore page. You can see all the courses and articles here",
            "This is the courses page. You can see all the courses here",
            "This is the articles page. You can see all the articles here",
            "This is your account action box. You can click to your profile picture open the menu. Then you can navigate to your profile, settings, and logout",
          ]}
          tourClassNames={["mx-4", "mx-4", "mx-4", "mx-4", "-translate-y-20"]}
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
