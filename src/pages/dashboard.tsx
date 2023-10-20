import type { NextPage } from "next";

import Head from "next/head";

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
          className="w-64"
          redirect="/explore"
          tours={[
            {
              message: "This is the dashboard. You can see your overall stats",
              default: {
                direction: "top",
                align: "start",
                targetQuery: "#dashboard-menu-item",
                className: "-translate-y-2",
              },
              mediaQueries: [
                {
                  taildwindQuery: "md",
                  direction: "right",
                  align: "start",
                  className: "ml-4",
                },
              ],
            },
            {
              message: "This is the explore page. Let's go there !",
              default: {
                direction: "top",
                align: "center",
                targetQuery: "#explore-menu-item",
              },
              mediaQueries: [
                {
                  taildwindQuery: "md",
                  direction: "right",
                  align: "center",
                },
              ],
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
