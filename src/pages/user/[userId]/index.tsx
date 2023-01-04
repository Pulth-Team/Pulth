import type { NextPage } from "next";
import Dashboard from "../../../components/layouts/dashboard";

import Image from "next/image";

import { useRouter } from "next/router";
import { trpc } from "../../../utils/trpc";

const ProfileIndex: NextPage = () => {
  const router = useRouter();
  const { userId } = router.query;

  const profileData = trpc.useQuery([
    "user.getUserById",
    { id: userId as string },
  ]);

  return (
    <Dashboard>
      <div className="flex flex-col p-8">
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
      </div>
    </Dashboard>
  );
};

export default ProfileIndex;
