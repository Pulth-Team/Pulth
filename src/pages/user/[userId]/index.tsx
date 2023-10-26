import type { NextPage } from "next";
import DashboardLayout from "~/components/layouts";

import Image from "next/legacy/image";

import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useEffect } from "react";

import Loading from "~/components/Loading";
import ArticleCard from "~/components/ArticleCard";
import DragScrollContainer from "~/components/DragScrollContainer";

import { UserPlusIcon, UserMinusIcon } from "@heroicons/react/24/outline";

const ProfileIndex: NextPage = () => {
  const router = useRouter();
  const { userId } = router.query;

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
      <div className="flex flex-col gap-y-8 p-8 px-16">
        <div className="flex justify-between">
          <div
            className="flex items-center gap-x-5 rounded-lg bg-white p-3"
            id="info-box"
          >
            <div className="relative h-36 w-36">
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
          <div className="flex w-5/12 items-center justify-end gap-x-16">
            <div className="flex flex-col items-center">
              <p className="text-2xl font-semibold">{followerCount}</p>
              <p>followers</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-2xl font-semibold">{followingCount}</p>
              <p>follows</p>
            </div>
            <div>
              <button
                className={`font-semibol flex items-center gap-x-2 rounded-lg px-5 py-1.5 text-lg ${
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
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-y-3">
          <h3 className="text-3xl font-bold">About Me</h3>
          <p className="text-lg text-black/80">{profileData.description}</p>
        </div>
        <div className="flex flex-col rounded-lg bg-white p-3" id="my-articles">
          <h3 className="mb-5 text-3xl font-bold">My Articles</h3>
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
    </DashboardLayout>
  );
};

export default ProfileIndex;
