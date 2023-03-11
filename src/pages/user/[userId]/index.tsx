import type { NextPage } from "next";
import Dashboard from "../../../components/layouts/dashboard";

import Image from "next/image";

import { useRouter } from "next/router";
import { trpc } from "../../../utils/trpc";
import React from "react";

import Loading from "../../../components/Loading";
import ArticleCard from "../../../components/ArticleCard";
import DragScrollContainer from "../../../components/DragScrollContainer";
import Tour from "../../../components/Tour";

import { UserPlusIcon } from "@heroicons/react/24/outline";
import { TRPCError } from "@trpc/server";

const ProfileIndex: NextPage = () => {
  const router = useRouter();
  const { userId } = router.query;

  const { data: profileData, status } = trpc.useQuery([
    "user.getUserById",
    { id: userId?.toString() || "" },
  ]);

  if (status === "loading")
    return (
      <Dashboard>
        <Loading className="border-2 w-16 h-16 m-16" />;
      </Dashboard>
    );
  if (status === "error" || !profileData || profileData instanceof TRPCError)
    return (
      <Dashboard>
        <div className="p-4">User Not Found</div>
      </Dashboard>
    );

  return (
    <Dashboard>
      <div className="flex flex-col p-8 px-16 gap-y-8">
        <div className="flex justify-between">
          <div
            className="flex items-center gap-x-5 bg-white p-3 rounded-lg"
            id="info-box"
          >
            <div className="h-36 w-36 relative">
              <Image
                src={profileData.image || "/default_profile.jpg"}
                layout="fill"
                className="rounded-full"
                alt="Profile Picture"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-2xl font-semibold">{profileData.name}</p>
              <p className="text-gray-600">{profileData.email}</p>
            </div>
          </div>
          <div className="w-5/12 flex items-center gap-x-16 justify-end">
            <div className="flex flex-col items-center">
              <p className="text-2xl font-semibold">1.56k</p>
              <p>followers</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-2xl font-semibold">1.56k</p>
              <p>follows</p>
            </div>
            <div>
              <button className="flex text-white bg-black py-1.5 px-5 rounded-lg font-semibold gap-x-2 text-lg items-center">
                <UserPlusIcon className="h-6 w-6 stroke-white" />
                Follow
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-y-3">
          <h3 className="text-3xl font-bold">About Me</h3>
          <p className="text-lg text-black/80">{profileData.description}</p>
        </div>
        <div className="flex flex-col bg-white p-3 rounded-lg" id="my-articles">
          <h3 className="text-3xl font-bold mb-5">My Articles</h3>
          <DragScrollContainer>
            {profileData.Articles.map((article) => (
              <ArticleCard
                Title={article.title}
                Author={{
                  Name: article.author.name!,
                  Image: article.author.image!,
                  UserId: article.author.id,
                }}
                createdAt={article.createdAt}
                isRecommended={false}
                key={article.slug}
                slug={article.slug}
              >
                {article.description}
              </ArticleCard>
            ))}
          </DragScrollContainer>
        </div>
      </div>
      <Tour
        className="w-96"
        start={"redirect"}
        onFinished={(e, message) => {
          if (e === "error") console.error(message);
        }}
        tours={[
          {
            targetQuery: "#info-box",
            message:
              "This is your info box. You can see your profile picture, name.",
            direction: "bottom",
            align: "start",
            className: "my-6",
          },
          {
            targetQuery: "#my-articles",
            message:
              "This is your articles. You can see your articles and you can click to read them.",
            direction: "bottom",
            align: "start",
            className: "my-6",
            redirect: "/profile",
          },
        ]}
      />
    </Dashboard>
  );
};

export default ProfileIndex;
