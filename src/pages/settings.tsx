import type { NextPage } from "next";

import Head from "next/head";
import Link from "next/link";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import DashboardLayout from "../components/layouts/dashboard";
import Image from "next/image";

import { Switch } from "@headlessui/react";
import ChevronLeftIcon from "@heroicons/react/24/solid/ChevronLeftIcon";

const Settings: NextPage = () => {
  const router = useRouter();

  const { data } = useSession();
  const user = data?.user;
  const [textareaCount, setTextareaCount] = useState(0);
  const [recomEnabled, setRecomEnabled] = useState(false);

  return (
    <DashboardLayout>
      <Head>
        <title>Pulth App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="p-10 flex flex-col gap-y-10">
        <div className="flex items-center gap-x-5">
          <ChevronLeftIcon
            onClick={() => router.back()}
            className="h-9 w-9 mt-1 cursor-pointer"
          ></ChevronLeftIcon>
          <h1 className="text-4xl font-bold">Settings</h1>
        </div>
        <div className="flex border-b-2 relative gap-x-5">
          <div className="border-b-2 border-indigo-600 pb-2 px-2 text-indigo-700 box-border translate-y-[1.5px] cursor-pointer">
            General
          </div>
          <div className="pb-2 px-2 translate-y-px cursor-pointer">
            Security
          </div>
          <div className="pb-2 px-2 translate-y-px cursor-pointer">Billing</div>
        </div>
        <div className="flex flex-col">
          <div>
            <h3 className="font-semibold text-xl">Profile</h3>
            <p className=" text-gray-500">
              This section is for your profile information. All these infos are
              able to seen in public.
            </p>
          </div>
          <div className="flex justify-between mt-5">
            <div className="flex flex-col justify-center gap-y-5 w-4/5">
              <div>
                <p>Name</p>
                <input
                  className="border-2 rounded-lg p-2 w-full focus:outline-none focus:border-indigo-600"
                  defaultValue={user?.name?.toString()}
                />
              </div>
              <div>
                <p>Email</p>
                <input
                  className="border-2 rounded-lg p-2 w-full disabled:bg-gray-200/50"
                  disabled
                  value={user?.email?.toString()}
                />
                <p className="text-gray-500 text-xs italic ml-1">
                  Disabled because of via login
                </p>
              </div>
            </div>
            <div className="relative cursor-pointer">
              <div className="absolute flex items-center justify-center text-white bg-black z-20 w-full rounded-full h-44 opacity-0 hover:opacity-60">
                Change Image
              </div>
              <Image
                src={user?.image || "/default_profile.jpg"}
                alt="profilePic"
                width={176}
                height={176}
                className="rounded-full"
              ></Image>
            </div>
          </div>
          <div className="flex w-full justify-between gap-x-7 mt-5">
            <div className="w-full">
              <p>About</p>
              <textarea
                className="border-2 rounded-lg w-full p-1 h-32 min-h-[44px] max-h-56"
                onChange={(e) => setTextareaCount(e.target.value.length)}
                maxLength={350}
              ></textarea>
              <p className="text-gray-500 text-xs italic ml-1">
                {textareaCount} / 350
              </p>
            </div>
            <div>
              <p>Title</p>
              <input className="border-2 rounded-lg p-2" />
              <p className="text-gray-500 text-xs italic ml-1">Teachers Only</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-xl mt-10">Management</h3>
            <p className=" text-gray-500">
              You can manage your account with this section. Nothing here will
              be displayed.
            </p>
            <div className="flex flex-col mt-5 gap-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-medium">Recom Engine</h4>
                  <p className="text-gray-500">
                    Allow Recom Engine to collect my data for personal
                    recomendations
                  </p>
                </div>
                <Switch
                  checked={recomEnabled}
                  onChange={() => setRecomEnabled(!recomEnabled)}
                  className={`${recomEnabled ? "bg-indigo-600" : "bg-slate-400"}
                    relative flex h-7 w-14 cursor-pointer rounded-full border-2 transition-colors duration-200 box-content ease-in-out 
                  `}
                >
                  <span className="sr-only">Toggle Recom Engine</span>
                  <span
                    aria-hidden="true"
                    className={`${
                      recomEnabled ? "translate-x-full" : "translate-x-0"
                    }
                      pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-sm border-2 ring-0 transition duration-200 ease-in-out`}
                  />
                </Switch>
              </div>
              <div>
                <button className="text-red-500 border-2 border-red-500 rounded-lg p-2 font-semibold transition-all hover:bg-red-500 hover:text-white duration-100 hover:shadow-xl hover:shadow-red-300 ">
                  Delete Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
