import type { NextPage } from "next";
import Dashboard from "../../../components/layouts/dashboard";

import Image from "next/image";

import { useRouter } from "next/router";
import { trpc } from "../../../utils/trpc";
import React from "react";

import Loading from "../../../components/Loading";
import ArticleCard from "../../../components/ArticleCard";
import DragScrollContainer from "../../../components/DragScrollContainer";

const ProfileIndex: NextPage = () => {
  const router = useRouter();
  const { userId } = router.query;

  const profileData = trpc.useQuery([
    "user.getUserById",
    { id: userId as string },
  ]);

  if (profileData.isFetching)
    return (
      <Dashboard>
        <Loading className="border-2 w-16 h-16 m-16" />;
      </Dashboard>
    );

  return (
    <Dashboard>
      <div className="flex flex-col p-8 px-16 gap-y-8">
        <div className="flex justify-between">
          <div className="flex items-center gap-x-5">
            <div className="h-36 w-36 relative">
              <Image
                src={profileData.data?.image || "/default_profile.jpg"}
                layout="fill"
                className="rounded-full"
                alt="Profile Picture"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-2xl font-semibold">{profileData.data?.name}</p>
              <p className="text-gray-600">{profileData.data?.email}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-y-3">
          <h3 className="text-3xl font-bold">About Me</h3>
          <p className="text-lg text-black/80">
            {profileData.data?.description}
          </p>
        </div>
        <div className="flex flex-col">
          <h3 className="text-3xl font-bold mb-5">My Articles</h3>
          <DragScrollContainer>
            {profileData.data?.Articles.map((article) => (
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
    </Dashboard>
  );
};

export default ProfileIndex;
