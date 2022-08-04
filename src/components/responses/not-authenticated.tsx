// imports GetServerSideProps from nextjs
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";

// creates a NextFunctionComponent
const NotAuthenticated: NextPage = () => {
  const currentPath = useRouter().pathname;

  return (
    <div className="flex flex-col justify-center h-screen gap-6 ">
      <h1 className="text-center text-5xl font-mono ">An0nym0us</h1>
      <p className="text-center text-xl font-mono px-4">
        It&apos;s looks we need to make sure who you are really before letting
        you in.
      </p>
      <Link
        href={{ pathname: "/api/auth/signin", query: { url: currentPath } }}
      >
        <a className="underline  text-xl  text-center font-mono">
          Click here to Login
        </a>
      </Link>
    </div>
  );
};

// exports it
export default NotAuthenticated;
