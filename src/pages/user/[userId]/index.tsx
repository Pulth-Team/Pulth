import type { NextPage } from "next";
import DashboardLayout from "~/components/layouts";

import Image from "next/legacy/image";

import { useRouter } from "next/router";
import { api } from "~/utils/api";
import React, { use, useEffect, useState } from "react";
import { Dialog, Tab } from "@headlessui/react";

import Loading from "~/components/Loading";
import ArticleCard from "~/components/ArticleCard";
import DragScrollContainer from "~/components/DragScrollContainer";

import { UserPlusIcon, UserMinusIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { set } from "zod";

const ProfileIndex: NextPage = () => {
  const router = useRouter();
  const { userId } = router.query;
  const { data: userData } = useSession();

  const [isOpen, setIsOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState<0 | 1>(0);

  const { data: profileData, status } = api.user.getUserById.useQuery(
    {
      id: userId?.toString() || "",
    },
    {
      enabled: !!userId, // if there is no userId, don't fetch
    }
  );

  const { data: followerCount, refetch: followerCountRefetch } =
    api.followSystem.getFollowerCount.useQuery(
      {
        accountId: userId?.toString() || "",
      },
      {
        enabled: !!userId, // if there is no userId, don't fetch
      }
    );

  const { data: followingCount, refetch: followingCountRefetch } =
    api.followSystem.getFollowingCount.useQuery(
      {
        accountId: userId?.toString() || "",
      },
      {
        enabled: !!userId, // if there is no userId, don't fetch
      }
    );

  const { data: isFollowing, refetch: isFollowingRefetch } =
    api.followSystem.isFollowing.useQuery(
      {
        accountId: userId?.toString() || "",
      },
      {
        enabled: !!userId, // if there is no userId, don't fetch
      }
    );

  const followMutation = api.followSystem.followUser.useMutation();
  const unfollowMutation = api.followSystem.unfollowUser.useMutation();

  useEffect(() => {
    if (followMutation.isSuccess || unfollowMutation.isSuccess) {
      followerCountRefetch();
      followingCountRefetch();
      isFollowingRefetch();
    }
  }, [
    followerCountRefetch,
    followingCountRefetch,
    isFollowingRefetch,
    unfollowMutation.isSuccess,
    followMutation.isSuccess,
  ]);

  useEffect(() => {
    if (profileData) {
      document.title = `${profileData.name} | Pulth`;
    }
  }, [profileData]);

  if (status === "loading")
    return (
      <DashboardLayout>
        <Loading className="m-16 h-16 w-16 border-2" />
      </DashboardLayout>
    );
  if (status === "error" || !profileData || profileData instanceof Error)
    return (
      <DashboardLayout>
        <div className="p-4">User Not Found</div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-y-3 px-4 py-8 lg:p-16">
        <div className="flex justify-between">
          <div
            className="flex items-center gap-x-5 rounded-lg bg-white"
            id="info-box"
          >
            <div className="relative h-16 w-16 lg:h-24 lg:w-24">
              <Image
                src={profileData.image || "/default_profile.jpg"}
                layout="fill"
                className="rounded-full"
                alt="Profile Picture"
              />
            </div>
            <p className="text-xl font-medium">{profileData?.name}</p>
          </div>
          <div className="hidden items-center gap-8 lg:flex">
            <div
              className="hover:cursor-pointer"
              onClick={() => {
                setIsOpen(true);
                setTabIndex(0);
              }}
            >
              <p className="text-center text-lg font-bold">{followerCount}</p>
              <p className="text-sm text-black/60">Followers</p>
            </div>
            <div
              className="hover:cursor-pointer"
              onClick={() => {
                setIsOpen(true);
                setTabIndex(1);
              }}
            >
              <p className="text-center text-lg font-bold">{followingCount}</p>
              <p className="text-sm text-black/60">Follows</p>
            </div>
            {userData?.user.id !== userId && (
              <button
                className={`ml-auto flex flex-none items-center justify-center gap-x-2 rounded-lg px-4 py-2 font-semibold ${
                  isFollowing
                    ? "border-2 border-indigo-500 bg-white text-indigo-500"
                    : "bg-indigo-500 text-white"
                }`}
                onClick={() => {
                  if (!userId) return;

                  if (isFollowing) {
                    unfollowMutation.mutate({ accountId: userId as string });
                  } else {
                    followMutation.mutate({ accountId: userId as string });
                  }
                }}
              >
                {isFollowing ? (
                  <UserMinusIcon className="h-6 w-6 stroke-indigo-500" />
                ) : (
                  <UserPlusIcon className="h-6 w-6 stroke-white" />
                )}
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-y-3 text-left">
          <p className="text-lg text-black/80">{profileData.description}</p>
        </div>
        <div className="flex w-full gap-2 lg:hidden">
          <div>
            <p className="text-center text-lg font-bold">{followerCount}</p>
            <p className="text-sm text-black/60">Followers</p>
          </div>
          <div>
            <p className="text-center text-lg font-bold">{followingCount}</p>
            <p className="text-sm text-black/60">Follows</p>
          </div>
          {userData?.user.id !== userId && (
            <button
              className={`ml-auto flex flex-none items-center gap-x-2 rounded-lg px-4 py-1 font-semibold ${
                isFollowing
                  ? "border-2 border-indigo-500 bg-white text-indigo-500"
                  : "bg-indigo-500 text-white"
              }`}
              onClick={() => {
                if (!userId) return;

                if (isFollowing) {
                  unfollowMutation.mutate({ accountId: userId as string });
                } else {
                  followMutation.mutate({ accountId: userId as string });
                }
              }}
            >
              {isFollowing ? (
                <UserMinusIcon className="h-6 w-6 stroke-indigo-500" />
              ) : (
                <UserPlusIcon className="h-6 w-6 stroke-white" />
              )}
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>

        <div
          className="flex flex-col rounded-lg bg-white pt-3"
          id="my-articles"
        >
          <h3 className="mb-5 text-xl font-semibold">Recent Articles</h3>
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
        <div
          className="flex flex-col rounded-lg bg-white pb-3 pr-3 pt-3"
          id="my-articles"
        >
          <h3 className="mb-3 text-xl font-semibold">Most popular courses</h3>
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
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className={
          "absolute inset-0 flex items-center justify-center bg-black/70 py-8"
        }
      >
        <Dialog.Panel className={"h-full w-full max-w-md bg-white"}>
          <Tab.Group
            selectedIndex={tabIndex}
            onChange={(index) => {
              setTabIndex(index as 0 | 1);
            }}
          >
            <Tab.List className={"order-2 flex justify-evenly border-b p-3"}>
              <Tab>Followers</Tab>
              <Tab>Follows</Tab>
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel>
                <div className="m-4 flex justify-evenly">
                  <div>
                    <div className="h-8 w-8 bg-cyan-500"></div>
                  </div>
                  <p className="flex items-center justify-center">
                    Emir Taştan
                  </p>
                  <div className="flex items-center justify-normal">
                    <button className="mr-2">Takip</button>
                    <button>Engel</button>
                  </div>
                </div>
              </Tab.Panel>
              <Tab.Panel>Content 2</Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </Dialog.Panel>
      </Dialog>
    </DashboardLayout>
  );
};

export default ProfileIndex;
