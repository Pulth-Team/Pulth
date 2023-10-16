import Link from "next/link";
import Image from "next/image";

import { Menu } from "@headlessui/react";
import {
  ArrowRightOnRectangleIcon,
  Cog8ToothIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

import { signOut } from "next-auth/react";

const MobileAccountBox = ({ image }: { image: string }) => {
  return (
    <Menu as="div" className={`self-stretch md:hidden`}>
      <Menu.Button className={`relative h-10 w-10 focus:outline-none`}>
        <Image
          src={image || "/default_profile.jpg"}
          alt="profile"
          fill
          sizes="40px"
          className="aspect-square rounded-full"
        ></Image>
      </Menu.Button>
      <Menu.Items className="absolute right-1 z-10 translate-y-3 rounded-md bg-gray-700 p-1 focus:outline-none active:outline-none">
        <Link href={"/profile"}>
          <Menu.Item>
            <div className="flex cursor-pointer items-center gap-x-1 rounded p-1 align-middle text-white hover:bg-gray-800 active:bg-gray-800">
              <UserCircleIcon className="h-5 w-5" />
              <p className="h-fit max-h-fit">Profile</p>
            </div>
          </Menu.Item>
        </Link>

        <Link href="/settings">
          <Menu.Item>
            <div className="flex cursor-pointer items-center gap-x-1 rounded p-1 align-middle text-white hover:bg-gray-800 active:bg-gray-800">
              <Cog8ToothIcon className="h-5 w-5"></Cog8ToothIcon>
              <p className="h-fit max-h-fit">Settings</p>
            </div>
          </Menu.Item>
        </Link>
        <Menu.Item>
          <div className="flex cursor-pointer items-center gap-x-1 rounded p-1 align-middle text-white hover:bg-gray-800 active:bg-gray-800">
            <ArrowRightOnRectangleIcon className="h-5 w-5"></ArrowRightOnRectangleIcon>
            <a className="max-h-min" onClick={() => signOut()}>
              Logout
            </a>
          </div>
        </Menu.Item>
      </Menu.Items>
    </Menu>
  );
};

export default MobileAccountBox;
