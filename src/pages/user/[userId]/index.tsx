import type { NextPage } from "next";
import DashboardLayout from "~/components/layouts";

import Image from "next/image";
import Link from "next/link";

import { useRouter } from "next/router";
import { api } from "~/utils/api";
import React, { useEffect, useState } from "react";

import Loading from "~/components/Loading";
import ArticleCard from "~/components/ArticleCard";
import DragScrollContainer from "~/components/DragScrollContainer";

import { UserPlusIcon, UserMinusIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import FollowDialog from "~/components/Dialogs/FollowSystemDialog";
import Head from "next/head";

const ProfileIndex: NextPage = () => {
  const router = useRouter();
  const { userId: profileUserId } = router.query;
  const { data: currentUserData } = useSession();

  const [isOpen, setIsOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<"follows" | "followers">(
    "followers"
  );

  const { data: profileData, status: profileDataStatus } =
    api.user.getUserById.useQuery(
      {
        id: profileUserId?.toString() || "",
      },
      {
        enabled: !!profileUserId, // if there is no profileUserId, don't fetch
        retry: false,
      }
    );

  const { data: followerCount, refetch: followerCountRefetch } =
    api.followSystem.getFollowerCount.useQuery(
      {
        accountId: profileUserId?.toString() || "",
      },
      {
        enabled: !!profileUserId, // if there is no profileUserId, don't fetch
        retry: false,
      }
    );

  const { data: followingCount, refetch: followingCountRefetch } =
    api.followSystem.getFollowingCount.useQuery(
      {
        accountId: profileUserId?.toString() || "",
      },
      {
        enabled: !!profileUserId, // if there is no profileUserId, don't fetch
        retry: false,
      }
    );

  const { data: isFollowing, refetch: isFollowingRefetch } =
    api.followSystem.isFollowing.useQuery(
      {
        accountId: profileUserId?.toString() || "",
      },
      {
        enabled: !!profileUserId, // if there is no profileUserId, don't fetch
        retry: false,
      }
    );

  const followMutation = api.followSystem.followUser.useMutation();
  const unfollowMutation = api.followSystem.unfollowUser.useMutation();

  useEffect(() => {
    if (profileData) {
      document.title = `${profileData.name} | Pulth`;
    }
  }, [profileData]);

  useEffect(() => {
    if (followMutation.isSuccess || unfollowMutation.isSuccess) {
      followerCountRefetch();
      followingCountRefetch();
      isFollowingRefetch();
    }
  }, [
    followMutation.isSuccess,
    unfollowMutation.isSuccess,
    followerCountRefetch,
    followingCountRefetch,
    isFollowingRefetch,
  ]);

  if (profileDataStatus === "loading")
    return (
      <DashboardLayout>
        <div className="flex min-h-content-area items-center justify-center">
          <Loading className="m-16 h-16 w-16 border-2" />
        </div>
      </DashboardLayout>
    );
  if (
    profileDataStatus === "error" ||
    !profileData ||
    profileData instanceof Error
  )
    return (
      <DashboardLayout>
        <div className="flex h-full min-h-content-area items-center justify-center">
          <div className="text-center">
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              User not found
            </h1>
            <p className="mt-3 text-base leading-7 text-gray-600">
              The user does not exist or has been deleted.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/explore"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Go back explore
              </Link>
              <a
                href="mailto:gulestanbekir@gmail.com"
                className="text-sm font-semibold text-gray-900"
              >
                Contact support <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <Head>
        <title>{profileData.name} - Pulth</title>
        <meta name="description" content={profileData.description ?? ""} />

        {/* OG meta tags */}
        <meta property="og:title" content={profileData.name ?? "No Name"} />
        <meta
          property="twitter:title"
          content={profileData.name ?? "No Name"}
        />

        <meta
          property="og:description"
          content={profileData.description ?? ""}
        />
        <meta
          property="twitter:description"
          content={profileData.description ?? ""}
        />

        <meta
          property="og:image"
          content={profileData.image ?? "/default_profile.jpg"}
        />
        <meta
          property="twitter:image"
          content={profileData.image ?? "/default_profile.jpg"}
        />
        <meta property="og:url" content={window.location.href} />
        <meta property="twitter:url" content={window.location.href} />
      </Head>

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
            <button
              className="rounded-lg px-4 py-2 font-semibold hover:cursor-pointer hover:bg-gray-100"
              onClick={() => {
                setIsOpen(true);
                setCurrentTab("followers");
              }}
            >
              <p className="text-center text-lg font-bold">{followerCount}</p>
              <p className="text-sm text-black/60">Followers</p>
            </button>
            <button
              className="rounded-lg px-4 py-2 font-semibold hover:bg-gray-100"
              onClick={() => {
                setIsOpen(true);
                setCurrentTab("follows");
              }}
            >
              <p className="text-center text-lg font-bold">{followingCount}</p>
              <p className="text-sm text-black/60">Follows</p>
            </button>
            {currentUserData?.user.id !== profileUserId && (
              <button
                className={`ml-auto flex flex-none items-center justify-center gap-x-2 rounded-lg px-4 py-2 font-semibold ${
                  isFollowing
                    ? "border-2 border-indigo-500 bg-white text-indigo-500"
                    : "bg-indigo-500 text-white"
                }`}
                onClick={() => {
                  if (!profileUserId) return;

                  if (isFollowing) {
                    unfollowMutation.mutate({
                      accountId: profileUserId as string,
                    });
                  } else {
                    followMutation.mutate({
                      accountId: profileUserId as string,
                    });
                  }
                }}
              >
                {followMutation.isLoading || unfollowMutation.isLoading ? (
                  <Loading
                    className={`h-6 w-6 border-2  ${
                      isFollowing
                        ? "border-gray-200"
                        : "border-gray-100 border-t-gray-400"
                    }`}
                  />
                ) : isFollowing ? (
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
          <p className="break-all text-lg text-black/80">
            {profileData.description}
          </p>
        </div>
        <div className="flex w-full gap-2 lg:hidden">
          <div
            className="hover:cursor-pointer"
            onClick={() => {
              setIsOpen(true);
              setCurrentTab("followers");
            }}
          >
            <p className="text-center text-lg font-bold">{followerCount}</p>
            <p className="text-sm text-black/60">Followers</p>
          </div>
          <div
            className="hover:cursor-pointer"
            onClick={() => {
              setIsOpen(true);
              setCurrentTab("follows");
            }}
          >
            <p className="text-center text-lg font-bold">{followingCount}</p>
            <p className="text-sm text-black/60">Follows</p>
          </div>
          {currentUserData?.user.id !== profileUserId && (
            <button
              className={`ml-auto flex flex-none items-center gap-x-2 rounded-lg px-4 py-1 font-semibold ${
                isFollowing
                  ? "border-2 border-indigo-500 bg-white text-indigo-500"
                  : "bg-indigo-500 text-white"
              }`}
              onClick={() => {
                if (!profileUserId) return;

                if (isFollowing) {
                  unfollowMutation.mutate({
                    accountId: profileUserId as string,
                  });
                } else {
                  followMutation.mutate({ accountId: profileUserId as string });
                }
              }}
            >
              {followMutation.isLoading || unfollowMutation.isLoading ? (
                <Loading
                  className={`h-6 w-6 border-2  ${
                    isFollowing
                      ? "border-gray-200"
                      : "border-gray-100 border-t-gray-400"
                  }`}
                />
              ) : isFollowing ? (
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
      <FollowDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        accountId={profileUserId as string}
        isSameUser={currentUserData?.user.id === profileUserId}
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
      />
    </DashboardLayout>
  );
};

export default ProfileIndex;
