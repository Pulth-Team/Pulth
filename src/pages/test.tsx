// create example page in react with typescript

// Path: src\pages\example.tsx
import Link from "next/link";
import type { NextPage } from "next";
import Head from "next/head";

const Example: NextPage = () => {
  return (
    <>
      <Head>
        <title>Example</title>
      </Head>
      <p>This is an example page.</p>
      <Link href="/api/auth/login">Login</Link>
      <br />
      <Link href="/api/auth/logout">Logout</Link>
      <br />
      <Link href="/accountInfo">Account Info</Link>
    </>
  );
};

export default Example;
