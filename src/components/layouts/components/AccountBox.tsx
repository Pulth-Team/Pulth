import Link from "next/link";
import Image from "next/image";

import { Menu } from "@headlessui/react";
import {
  ArrowLeftOnRectangleIcon,
  Cog8ToothIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

import { twMerge } from "tailwind-merge";
import { signOut } from "next-auth/react";

const AccountBox = ({
  image,
  name,
  path,
  id,
  className,
}: {
  image: string;
  name: string;
  path: string;
  id: string;
  className?: string;
}) => {
  return (
    <div
      className={twMerge(
        "flex",
        className,
        "mt-auto rounded-md bg-gray-700 p-2 "
      )}
      id="current-account-box"
    >
      <Menu>
        <Menu.Button className="relative h-12 w-12 overflow-hidden rounded-full">
          <Image
            src={image || "/default_profile.jpg"}
            className="rounded-full"
            fill
            sizes="48px"
            alt="Profile Picture"
          />
        </Menu.Button>
        <Menu.Items
          className={`absolute bottom-0 -translate-y-20 rounded-md bg-gray-700 p-1 `}
        >
          <Menu.Item>
            <div>
              <Link
                href="/profile"
                className={`${
                  path === "/profile" ? "bg-gray-600" : "bg-gray-700"
                } flex cursor-pointer flex-row items-center gap-2 rounded-md p-2  text-gray-100`}
              >
                <UserCircleIcon className="h-6 w-6" />
                <p>Profile</p>
              </Link>
            </div>
          </Menu.Item>
          <Menu.Item>
            <div>
              <Link
                href="/settings"
                className={`${
                  path === "/settings" ? "bg-gray-600" : "bg-gray-700"
                } flex cursor-pointer flex-row items-center gap-2 rounded-md p-2  text-gray-100`}
              >
                <Cog8ToothIcon className="h-6 w-6" />
                <p>Settings</p>
              </Link>
            </div>
          </Menu.Item>

          <Menu.Item>
            <a
              onClick={() => signOut()}
              className={` flex cursor-pointer flex-row items-center gap-2 rounded-md p-2  text-gray-100`}
            >
              <ArrowLeftOnRectangleIcon className="h-6 w-6" />
              <p>Logout</p>
            </a>
          </Menu.Item>
        </Menu.Items>
      </Menu>
      <div className="ml-2 flex flex-col">
        <p className="font-semibold text-gray-200">{name}</p>
        <Link
          href={`/profile`}
        >
          <button
            className="text-left text-sm text-gray-400 hover:text-gray-100"
            id="view-profile-btn"
          >
            View Profile
          </button>
        </Link>
      </div>
    </div>
  );
};

export default AccountBox;
