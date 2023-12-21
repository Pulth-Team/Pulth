import Link from "next/link";
import Search from "./components/Search";
import MobileAccountBox from "./components/MobileAccountBox";
import { useSession } from "next-auth/react";

const Topbar = ({ inLayout = false }) => {
  const { data: userData, status: userStatus } = useSession();

  return (
    <>
      <header className="fixed inset-x-0 z-10 flex justify-between bg-gray-800 p-2">
        <Link href="/" className="px-2 py-1">
          <span className="text-xl font-bold text-indigo-500">PulthApp</span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          {userStatus !== "authenticated" && (
            <Link href="/api/auth/signin">
              <button className="flex rounded-md bg-gray-700 p-2 md:hidden">
                <p className="flex items-center justify-center text-center font-semibold text-gray-200 ">
                  Login
                </p>
              </button>
            </Link>
          )}
          <Search />
          {userStatus == "authenticated" && (
            <MobileAccountBox
              image={userData?.user?.image ?? "/default_profile.jpg"}
            />
          )}
        </div>
      </header>
      {!inLayout && <div className="pb-14"></div>}
    </>
  );
};

export default Topbar;
