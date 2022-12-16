import type { NextPage } from "next";

import { trpc } from "../utils/trpc";
import {
  getASTfromHTML,
  PureElementAST,
  ValidateTree,
} from "../utils/editorHelpers";
import Head from "next/head";
import Link from "next/link";

import { useSession } from "next-auth/react";

import DashboardLayout from "../components/layouts/dashboard";
import { useState } from "react";

const Dashboard: NextPage = () => {
  // const batchFetch = trpc.useQuery(["article.batch-data"]);

  const { data } = useSession();
  const user = data?.user;

  const [parsed, setParsed] = useState<any>("");
  const [validity, setValidity] = useState<any>("");
  const InlineOutput =
    // 'generate an <code class="inline-ode">audio version</code> and so on.';
    'workspace consists of separate<mark class="cdx-marker"> Blocks: paragraphs,</mark> headings<mark class="cdx-marker">, images, <i>lists</i>, quotes,</mark> etc.&nbsp;';

  const Parse = () => {
    setValidity("");
    const AST = getASTfromHTML(InlineOutput);
    setParsed(AST);
  };

  const Validity = () => {
    setParsed("");
    const AST = getASTfromHTML(InlineOutput);
    console.log(AST);
    const validity = ValidateTree(AST);
    setValidity(validity);
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
        <button onClick={Parse}>Parse HTML to AST</button>
        <button onClick={Validity}>Check Validity</button>
        <br />
        <br />
        <p>{JSON.stringify(parsed)}</p>
        <p>{JSON.stringify(validity)}</p>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
