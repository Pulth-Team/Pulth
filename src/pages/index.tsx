import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import FacebookIcon from "~/components/icons/FacebookIcon";
import TwitterIcon from "~/components/icons/TwitterIcon";
import {
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import Search from "~/components/layouts/components/Search";

const Home: NextPage = () => {
  return (
    <div className="bg-pink-500">
      <Head>
        <title>Welcome to Pulth!</title>
        <meta
          name="description"
          content="Unlock Your Potential with Our Cutting-Edge Learning Website! Explore a World of Knowledge, from Expert Tutorials to Interactive Courses."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className="flex h-14 items-center gap-2 bg-gray-800 px-4 md:gap-4 md:px-6">
        <span className="mr-auto text-xl font-bold text-indigo-500">
          PulthApp
        </span>
        <div className="flex items-stretch gap-2">
          <Link href={"/api/auth/signin"}>
            <button className="h-full rounded-lg bg-gray-700 px-3 py-1 text-white">
              Login
            </button>
          </Link>
          <Search />
        </div>
      </nav>
      <div className="flex h-[calc(100vh-56px)] flex-col items-center justify-center gap-4 bg-gradient-to-tr from-gray-800 to-gray-700">
        <h1 className=" text-3xl tracking-tighter text-white">
          <span className="font-bold">Don&apos;t worry</span> about courses
          <br />
          <span className="font-bold">Focus</span> on courses.
        </h1>
        <p className="px-8 text-sm text-white/80">
          Explore articles with your interest, check out the authors and
          instructors. Pay for the course only after you like the instructor
        </p>
        <div>
          <Link href={"/explore"}>
            <button className="mr-4 h-9 rounded-lg bg-indigo-500 px-3 py-1 text-white">
              Explore
            </button>
          </Link>
          <Link href={"/api/auth/signin"}>
            <button className="h-9 rounded-lg bg-gray-700 px-3 py-1 text-white">
              Join Now
            </button>
          </Link>
        </div>
        <Image
          src={"/undraw_learning_sketching_nd4f.svg"}
          width={580}
          height={480}
          alt="A person sitting on a desk, with a laptop, and a book."
          className="px-12"
        />
      </div>
      <div>
        <div className="relative h-fit">
          <div className="absolute bottom-0 left-0 w-full rotate-180 overflow-hidden leading-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                className="w-[calc(100% + 1.3px)] relative block h-[150px] fill-gray-700"
              ></path>
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-y-6 bg-gray-700 px-4 py-8">
          <div className="flex flex-col items-center rounded-2xl bg-gray-600 p-8 text-center text-white">
            <QuestionMarkCircleIcon className="my-6 h-12 w-12" />
            <h3 className="text-xl font-medium leading-7">Questions</h3>
            <p className="pt-2">
              Do you have questions? Ask to the community or directly to
              instructor. Either way you will find your answer here!
            </p>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-gray-600 p-8 text-center text-white">
            <DocumentTextIcon className="my-6 h-12 w-12" />
            <h3 className="text-xl font-medium leading-7">Engage in Content</h3>
            <p className="pt-2">
              We have articles about the topic you want to learn. You can read
              and ask question directly to the authors!
            </p>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-gray-600 p-8 text-center text-white">
            <ArrowTrendingUpIcon className="my-6 h-12 w-12" />
            <h3 className="text-xl font-medium leading-7">Learning Path</h3>
            <p className="pt-2">
              Before you buy a course go check the curriculum! See if it has
              projects or the topics you are interested in!
            </p>
          </div>
        </div>

        <div className="relative h-fit">
          <div className="absolute left-0 top-0 w-full overflow-hidden leading-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                className="w-[calc(100% + 1.3px)] relative block h-[150px] fill-gray-700"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
