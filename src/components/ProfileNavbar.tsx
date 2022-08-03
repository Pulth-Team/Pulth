import type { NextPage } from "next";

import { Menu } from "@headlessui/react";
import Link from "next/link";

import { Session } from "next-auth";
import Image from "next/image";

const Dashboard: NextPage<{ user: Session["user"] }> = ({ user }) => {
  if (!user) throw new Error("User is Undefined");

  return (
    <>
      <p>{user.name}</p>
      <Menu as="div" className="relative inline-block text-left">
        <div className="w-12 h-12 relative">
          <Menu.Button>
            <Image
              layout="fill"
              src={user.image || "/images/default-user.png"}
              alt={"Pulth Account " + user.name}
              objectFit="contain"
              className="bg-slate-500 w-4"
            />
          </Menu.Button>
        </div>

        <Menu.Items className="absolute right-0 bg-white shadow-md  rounded p-1 ">
          <div className=" gap-1 ">
            <Menu.Item>
              <div className="p-1 hover:bg-slate-100 active:bg-slate-200 cursor-pointer rounded">
                <Link href="/api/auth/signout">Logout</Link>
              </div>
            </Menu.Item>
            {/* <Menu.Item>
              <div className="p-1 hover:bg-slate-100 active:bg-slate-200 cursor-pointer rounded">
                Settings
              </div>
            </Menu.Item> */}
          </div>
        </Menu.Items>
      </Menu>
    </>
  );
};

export default Dashboard;
