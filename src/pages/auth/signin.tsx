import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import { getProviders, signIn, useSession } from "next-auth/react";
import { Provider } from "next-auth/providers";
import { useRouter } from "next/router";
import { useState } from "react";

const Home: NextPage<{ providers: Provider[] }> = ({ providers }) => {
  const router = useRouter();
  const { status } = useSession();

  if (status == "authenticated") {
    router.push("/dashboard");
  }
  const { error } = router.query;
  const [email, setEmail] = useState<string>("");

  return (
    //   <div className="flex h-screen flex-col items-center justify-center">
    //     {error && <SignInError error={error as AuthError} />}

    //     <div className="m-1 rounded border p-2 shadow hover:shadow-md active:shadow">
    //       <button onClick={() => signIn("google")}>Sign in with Google</button>
    //     </div>
    //     {/*
    //      {Object.values(providers).map((provider) => (
    //       <div
    //         key={provider.name}
    //         className="border hover:shadow-md shadow active:shadow p-2 m-1 rounded"
    //       >
    //         <button onClick={() => signIn(provider.id)}>
    //           Sign in with {provider.name}
    //         </button>
    //       </div>
    //     ))}
    //     */}
    //   </div>

    <div className="flex h-screen items-center justify-center ">
      <div className="z-10 mx-4 flex w-full max-w-md flex-col gap-y-2 rounded-xl bg-gray-700 p-4 text-white">
        <h1 className="text-3xl">
          Welcome to <span className="font-bold text-indigo-500">Pulth</span>
        </h1>
        <div className="flex flex-col">
          Email
          <input
            type="text"
            className="mb-2 rounded-md border-2 border-gray-500 p-1 text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="rounded-md bg-gray-600 p-2 hover:shadow-md"
            onClick={() =>
              signIn("email", {
                email,
                callbackUrl: "/dashboard",
              })
            }
          >
            Continue with Email
          </button>
        </div>

        <hr />

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="rounded-md bg-gray-600 p-2 text-center transition-all duration-200 hover:bg-gray-500 hover:shadow-md motion-reduce:transition-none"
        >
          Continue with Google
        </button>

        <button
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          className="rounded-md bg-gray-600 p-2 text-center transition-all duration-200 hover:bg-gray-500 hover:shadow-md motion-reduce:transition-none"
        >
          Continue with Github
        </button>
      </div>
      <div className="relative inset-0 -z-10 bg-purple-700"></div>
      <Image
        src="/stacked-steps.svg"
        fill
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover brightness-50 contrast-75"
      />
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
