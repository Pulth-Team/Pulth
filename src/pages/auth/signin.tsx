import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import { getProviders, signIn, useSession } from "next-auth/react";
import { Provider } from "next-auth/providers";
import { useRouter } from "next/router";
import { useState } from "react";
import Search from "~/components/layouts/components/Search";

const Home: NextPage<{ providers: Provider[] }> = ({ providers }) => {
  const router = useRouter();
  const { status } = useSession();

  if (status == "authenticated") {
    router.push("/dashboard");
  }
  
  const { error } = router.query;
  const [email, setEmail] = useState<string>("");

  return (
    <div>
      <Head>
        <title>Login - PulthApp</title>
      </Head>
      <nav className="fixed flex h-14 w-screen items-center gap-2 bg-gray-800 px-4 md:gap-4 md:px-6">
        <Link href="/" className="mr-auto text-xl font-bold text-indigo-500">
          <span >
            PulthApp
          </span>
        </Link>
        <div className="flex items-stretch gap-2">
          <Link href={"/api/auth/signin"}>
            <button className="h-full rounded-lg bg-gray-700 px-3 py-1 text-white">
              Login
            </button>
          </Link>
          <Search />
        </div>
      </nav>
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="flex w-full max-w-md flex-col gap-y-2 px-2 text-white">
          <h1 className="text-center text-3xl ">
            Login to <span className="text-indigo-500">PulthApp</span>
          </h1>
          {error && <SignInError error={error as AuthError} />}

          <hr className="my-2" />
          <div className="flex flex-col">
            <input
              type="email"
              name="E-mail"
              className="mb-2 rounded-md p-3 text-black outline-none placeholder:text-gray-500"
              value={email}
              placeholder="Email Address"
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={() =>
                signIn("email", { email, callbackUrl: "/dashboard" })
              }
              className="rounded-md bg-white p-2 text-center text-lg text-black transition-all duration-200 hover:bg-gray-300 hover:shadow-md motion-reduce:transition-none"
            >
              Continue with Email
            </button>
          </div>
          <hr className="my-2" />
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="rounded-md bg-gray-600 p-2 text-center text-lg  outline-gray-700 transition-all duration-200 hover:bg-gray-500 hover:shadow-md motion-reduce:transition-none"
          >
            Continue with Google
          </button>
          <button
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="rounded-md bg-gray-600 p-2 text-center text-lg transition-all duration-200 hover:bg-gray-500 hover:shadow-md motion-reduce:transition-none"
          >
            Continue with Github
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;

// export async function getServerSideProps() {
//   const providers = await getProviders();
//   providers;
//   return {
//     props: { providers },
//   };
// }

enum AuthError {
  Signin = "Try signing with a different account.",
  OAuthSignin = "Try signing with a different account.",
  OAuthCallback = "Try signing with a different account.",
  OAuthCreateAccount = "Try signing with a different account.",
  EmailCreateAccount = "Try signing with a different account.",
  Callback = "Try signing with a different account.",
  OAuthAccountNotLinked = "To confirm your identity, sign in with the same account you used originally.",
  EmailSignin = "Check your email address.",
  CredentialsSignin = "Sign in failed. Check the details you provided are correct.",
  default = "Unable to sign in.",
}

const SignInError = ({ error }: { error: AuthError }) => {
  //   const errorMessage = error && (AuthError[error] ?? errors.default);
  return <div>{error}</div>;
};
