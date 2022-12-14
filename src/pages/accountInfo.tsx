import React from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import Link from "next/link";

export default function Profile() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  console.log(user);
  return (
    user && (
      <div>
        <Image
          src={user.picture ?? "/default_profile.jpg"}
          alt={user.name ?? "Default User Name"}
          width={100}
          height={100}
        />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <Link href="/test"> Go back to test</Link>

        <button
          onClick={() => {
            fetch(
              "https://login.auth0.com/api/v2/users/google-oauth2%7C105932611920341337875?include_fields=true",
              { credentials: "same-origin" }
            )
              .then((response) => response.json())
              .then((data) => console.log(data));
          }}
        >
          Send Req
        </button>
      </div>
    )
  );
}
