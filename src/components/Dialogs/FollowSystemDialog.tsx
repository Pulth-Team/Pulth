import { Dialog, Tab } from "@headlessui/react";
import { useState } from "react";
import Image from "next/image";
import { api } from "~/utils/api";
import Loading from "../Loading";
import Link from "next/link";

interface FollowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: "follows" | "followers";
  accountId: string;
  isSameUser: boolean;
  onTabChange: (tab: "follows" | "followers") => void;
}

const FollowDialog = ({
  isOpen,
  onClose,
  currentTab,
  onTabChange,
  accountId,
  isSameUser,
}: FollowDialogProps) => {
  const {
    data: Followers,
    refetch: followersRefetch,
    isLoading: isFollowersLoading,
    remove: followersReset,
  } = api.followSystem.getFollowers.useQuery(
    { accountId: accountId },
    {
      enabled: currentTab === "followers",
    }
  );

  const {
    data: Follows,
    refetch: followsRefetch,
    isLoading: isFollowsLoading,
    remove: followsReset,
  } = api.followSystem.getFollows.useQuery(
    { accountId: accountId },
    {
      enabled: currentTab === "follows",
    }
  );

  const removeFollowerMutation = api.followSystem.removeFollower.useMutation();
  const unfollowMutation = api.followSystem.unfollowUser.useMutation();

  const [lastRemovedId, setLastRemovedId] = useState("");

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        onClose();
      }}
      className={
        "absolute inset-0 z-10 flex items-center justify-center bg-black/70 py-32 "
      }
    >
      <Dialog.Panel className={"h-full w-full max-w-md rounded-md bg-white"}>
        <Tab.Group
          selectedIndex={currentTab == "followers" ? 0 : 1}
          onChange={(index) => {
            onTabChange(index == 0 ? "followers" : "follows");
          }}
        >
          <Tab.List className={"order-2 flex justify-evenly border-b p-3"}>
            <Tab
              className={`${
                currentTab == "followers" ? "border-b-2 border-black" : ""
              }`}
            >
              Followers
            </Tab>
            <Tab
              className={`${
                currentTab === "follows" ? "border-b-2 border-black" : ""
              }`}
            >
              Follows
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              {isFollowersLoading ? (
                <div>
                  <Loading className="h-12 w-12 border-2" />
                </div>
              ) : (
                ""
              )}
              {Followers?.map((follower) => (
                <div className="m-4 flex justify-between" key={follower.id}>
                  <div className="flex items-center justify-center gap-2">
                    <Image
                      className="rounded-full"
                      src={follower.image ?? "/default_profile.jpg"}
                      alt="profile"
                      height={32}
                      width={32}
                    ></Image>
                    <Link
                      href={"/user/" + follower.id}
                      onClick={() => {
                        followersReset();
                        followsReset();
                        onClose();
                      }}
                    >
                      {follower.name}
                    </Link>
                  </div>
                  <div className="flex items-center justify-normal">
                    <button
                      className={`ml-auto flex flex-none items-center justify-center gap-x-2 rounded-lg bg-indigo-500 px-4 py-2 text-white ${
                        !isSameUser ? "hidden" : ""
                      }`}
                      onClick={() => {
                        setLastRemovedId(follower.id as string);
                        removeFollowerMutation
                          .mutateAsync({
                            accountId: follower.id as string,
                          })
                          .then(() => {
                            followersRefetch();
                          });
                      }}
                    >
                      Remove
                      {removeFollowerMutation.isLoading &&
                      lastRemovedId == follower.id ? (
                        <Loading className="h-5 w-5 border-2" />
                      ) : (
                        ""
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </Tab.Panel>
            <Tab.Panel>
              {isFollowsLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loading className="h-12 w-12 border-2" />
                </div>
              ) : (
                ""
              )}
              {Follows?.map((follower) => (
                <div className="m-4 flex justify-between" key={follower.id}>
                  <div className="flex items-center justify-center gap-2">
                    <Image
                      className="rounded-full"
                      src={follower.image ?? "/default_profile.jpg"}
                      alt="profile"
                      height={32}
                      width={32}
                    ></Image>
                    <Link
                      href={"/user/" + follower.id}
                      onClick={() => {
                        followersReset();
                        followsReset();
                        onClose();
                      }}
                    >
                      {follower.name}
                    </Link>
                  </div>
                  <div className="flex items-center justify-normal">
                    <button
                      className={`ml-auto flex flex-none items-center justify-center gap-x-2 rounded-lg bg-indigo-500 px-4 py-2 text-white ${
                        !isSameUser ? "hidden" : ""
                      }`}
                      onClick={() => {
                        setLastRemovedId(follower.id as string);
                        unfollowMutation
                          .mutateAsync({
                            accountId: follower.id as string,
                          })
                          .then(() => {
                            followsRefetch();
                          });
                      }}
                    >
                      {unfollowMutation.isLoading &&
                      lastRemovedId == follower.id ? (
                        <Loading className="h-5 w-5 border-2" />
                      ) : (
                        ""
                      )}
                      Following
                    </button>
                  </div>
                </div>
              ))}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </Dialog.Panel>
    </Dialog>
  );
};

export default FollowDialog;
