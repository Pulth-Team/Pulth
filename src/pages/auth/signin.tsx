import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { getProviders, signIn, useSession } from "next-auth/react";
import { Provider } from "next-auth/providers";
import { useRouter } from "next/router";

const Home: NextPage<{ providers: Provider[] }> = ({ providers }) => {
  const router = useRouter();
  const { status } = useSession();

  if (status == "authenticated") {
    router.push("/dashboard");
  }
  const { error } = router.query;

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      {error && <SignInError error={error as AuthError} />}

      <div className="border hover:shadow-md shadow active:shadow p-2 m-1 rounded">
        <button onClick={() => signIn("google")}>Sign in with Google</button>
      </div>
      {/* {Object.values(providers).map((provider) => (
        <div
          key={provider.name}
          className="border hover:shadow-md shadow active:shadow p-2 m-1 rounded"
        >
          <button onClick={() => signIn(provider.id)}>
            Sign in with {provider.name}
          </button>
        </div>
      ))} */}
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
