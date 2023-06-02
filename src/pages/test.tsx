import { useState } from "react";
import Tour from "~/components/Tour";
import Dashboard from "~/components/layouts/gridDashboard";

const TestPage = () => {
  const [start, setStart] = useState<boolean>(true);

  return (
    <Dashboard>
      <p id="nice-text" className="w-3/6">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eligendi
        dolores doloribus similique quo aperiam, magni natus alias blanditiis at
        temporibus voluptates ducimus optio recusandae, sunt officiis explicabo
        totam cumque? Sapiente! Nisi qui id quam sunt quos illum, commodi ut
        velit necessitatibus, sed veniam vitae! Sunt dolor aliquid velit
        cupiditate atque iste ad nisi excepturi ratione temporibus. Omnis
        ducimus quibusdam eligendi? Non cupiditate ipsa iusto sint quidem
        temporibus. Distinctio sint culpa modi eveniet cumque possimus, beatae
        doloribus, quod similique voluptate, quisquam eligendi earum sunt.
        Temporibus commodi doloribus, sunt deserunt officiis debitis?
      </p>
      <button
        onClick={() => {
          setStart(true);
        }}
        className="rounded-md bg-slate-200 p-2 shadow-md"
      >
        start Tour
      </button>
      <Tour
        start={start}
        onClosed={() => {
          setStart(false);
        }}
        tours={[
          {
            targetQuery: "#nice-text",
            message: "bottom start",
            direction: "bottom",
            align: "start",
          },
          {
            targetQuery: "#nice-text",
            message: "bottom center",

            direction: "bottom",
            align: "center",
          },
          {
            targetQuery: "#nice-text",
            message: "bottom end",

            direction: "bottom",
            align: "end",
          },

          {
            targetQuery: "#nice-text",
            message: "right start",

            direction: "right",
            align: "start",
          },
          {
            targetQuery: "#nice-text",
            message: "right center",
            skip: true,

            direction: "right",
            align: "center",
          },
          {
            targetQuery: "#nice-text",
            message: "right end",

            redirect: "/test_2",

            direction: "right",
            align: "end",
          },
        ]}
        onFinished={(e, message) => {
          setStart(false);
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
            case "backdrop":
              console.log("Backdrop clicked");
              break;
            case "success":
              console.log("Tour finished successfully");
              break;
          }
        }}
      />
    </Dashboard>
  );
};

export default TestPage;
