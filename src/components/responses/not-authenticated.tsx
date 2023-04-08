// imports GetServerSideProps from nextjs
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

// creates a NextFunctionComponent
const NotAuthenticated: NextPage = () => {
  const currentPath = useRouter().pathname;

  return (
    <div className="flex h-screen flex-col justify-center gap-6 ">
      <h1 className="font-mono text-center text-5xl ">An0nym0us</h1>
      <p className="font-mono px-4 text-center text-xl">
        It&apos;s looks we need to make sure who you are really before letting
        you in.
      </p>
      <Link
        href={{ pathname: "/api/auth/signin", query: { url: currentPath } }}
        className="font-mono  text-center  text-xl underline"
      >
        Click here to Login
      </Link>
    </div>
  );
};

// exports it
export default NotAuthenticated;
