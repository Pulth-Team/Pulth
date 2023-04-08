import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import FacebookIcon from "~/components/icons/FacebookIcon";
import TwitterIcon from "~/components/icons/TwitterIcon";
import { MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";

const Home: NextPage = () => {
  const ref = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const isInView = useInView(ref, { once: true });
  const isInView2 = useInView(ref2, { once: true });
  const isInView3 = useInView(ref3, { once: true });
  return (
    <div className="bg-gray-900">
      <Head>
        <title>Pulth App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className="sticky top-0 z-20 hidden w-full items-center bg-slate-800 p-4 align-middle sm:flex lg:flex">
        <span className="my-auto mr-auto self-stretch text-2xl font-bold text-indigo-500">
          PulthApp
        </span>
        <div className="hidden items-center gap-x-8 sm:flex">
          <Link href={"/explore"}>
            <button className="p-2 text-xl font-semibold text-white">
              Explore
            </button>
          </Link>
          <Link href={"/courses"}>
            <button className="p-2 text-xl font-semibold text-white">
              Courses
            </button>
          </Link>
          <Link href={"/articles"}>
            <button className="p-2 text-xl font-semibold text-white">
              Articles
            </button>
          </Link>
          <Link href="/api/auth/signin">
            <button className="rounded p-2 text-xl font-bold text-indigo-500">
              Join Now!
            </button>
          </Link>
        </div>
      </nav>
      <main className="flex flex-col overflow-x-hidden">
        <div className="flex h-screen flex-col items-center justify-center bg-gray-900 sm:px-28 sm:pt-8 lg:flex-row lg:justify-between lg:px-16 lg:pt-0">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {
                opacity: 0,
                x: -100,
              },
              visible: {
                opacity: 1,
                x: 0,
                transition: {
                  delay: 0.5,
                  duration: 0.5,
                },
              },
            }}
            className="lg:w-3/4"
          >
            <div className="flex h-full w-full flex-col items-center justify-center gap-y-5 p-4 font-slab tracking-tighter lg:p-8">
              <p className="text-center text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-left lg:text-6xl">
                <span className="text-indigo-500">Pulth</span> is the new way of
                learning.
                <br className="hidden lg:block" /> Now it&apos;s your time to{" "}
                <span className="text-indigo-500">learn</span> with quality!
              </p>
              <div className="w-fit lg:w-full">
                <Link href="/api/auth/signin">
                  <button className="rounded-lg bg-indigo-500 p-3 font-semibold text-white lg:text-3xl">
                    Join for free
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="block sm:hidden lg:block"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {
                opacity: 0,
                x: 100,
              },
              visible: {
                opacity: 1,
                x: 0,
                transition: {
                  delay: 0.8,
                  duration: 0.6,
                },
              },
            }}
          >
            <Image
              src="/undraw_online_learning_re_qw08.svg"
              height={800}
              width={800}
              alt="learning"
            />
          </motion.div>
          <motion.div
            className="hidden sm:block lg:hidden"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {
                opacity: 0,
                x: 100,
              },
              visible: {
                opacity: 1,
                x: 0,
                transition: {
                  delay: 0.8,
                  duration: 0.6,
                },
              },
            }}
          >
            <Image
              src="/undraw_online_learning_re_qw08.svg"
              height={600}
              width={600}
              alt="learning"
            />
          </motion.div>
        </div>
        <div className="mb-12 flex h-screen snap-center flex-col items-center justify-center gap-y-0 bg-gray-900 sm:gap-y-12 sm:px-28 lg:mb-0 lg:flex-row-reverse lg:justify-between lg:gap-y-0 lg:px-16 lg:pt-16">
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-y-5 p-4 font-slab tracking-tighter opacity-60 transition-all duration-200 ease-in-out sm:h-fit lg:h-full lg:w-3/4 lg:items-start lg:p-8 lg:delay-500 lg:duration-500"
            style={{
              transform: isInView ? "none" : "translateX(200px)",
              opacity: isInView ? 1 : 0,
            }}
            ref={ref}
          >
            <p className="text-center text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-left lg:text-6xl">
              You can <span className="text-indigo-500">learn for free </span>
              by reading articles written by our community!
            </p>
            <div>
              <Link href="/articles">
                <button className="rounded-lg bg-indigo-500 p-3 font-semibold text-white lg:text-3xl">
                  View Articles
                </button>
              </Link>
            </div>
          </div>
          <div
            className="transition-all delay-200 duration-500 ease-in-out lg:delay-700 lg:duration-700"
            ref={ref}
            style={{
              transform: isInView ? "none" : "translateX(-200px)",
              opacity: isInView ? 1 : 0,
            }}
          >
            <Image
              src="/undraw_knowledge_re_5v9l.svg"
              height={800}
              width={800}
              alt="learning"
              className="-translate-x-6 lg:mr-0"
            />
          </div>
        </div>
        <div className="flex h-screen flex-col items-center justify-center gap-y-12 bg-gray-900 pt-16 sm:px-28 sm:pt-0 lg:flex-row lg:justify-between lg:gap-y-0 lg:px-16 lg:pt-16">
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-y-5 p-4 font-slab tracking-tighter transition-all duration-200 ease-in-out sm:h-fit lg:h-full lg:w-3/4 lg:items-start lg:p-8 lg:delay-500 lg:duration-500"
            style={{
              transform: isInView2 ? "none" : "translateX(-200px)",
              opacity: isInView2 ? 1 : 0,
            }}
            ref={ref2}
          >
            <p className="text-center text-4xl font-bold leading-tight text-white lg:text-left lg:text-6xl">
              We are giving you the privilege of learning from
              <span className="text-indigo-500"> verified teachers </span>
              chosen by our algorithm!
            </p>
            <div>
              <Link href={"/courses"}>
                <button className="rounded-lg bg-indigo-500 p-3 font-semibold text-white lg:text-3xl">
                  View Courses
                </button>
              </Link>
            </div>
          </div>
          <div
            className="transition-all delay-200 duration-500 ease-in-out lg:delay-700 lg:duration-700"
            style={{
              transform: isInView2 ? "none" : "translateX(200px)",
              opacity: isInView2 ? 1 : 0,
            }}
          >
            <Image
              src="/undraw_video_streaming_re_v3qg.svg"
              height={800}
              width={800}
              alt="learning"
            />
          </div>
        </div>
        <div className="flex h-screen flex-col items-center justify-center bg-gray-900 p-4 sm:px-28 lg:px-16">
          <div
            className="flex h-fit flex-col items-center justify-center gap-y-6 pb-0 font-slab tracking-tighter transition-all duration-200 ease-in-out lg:p-4 lg:delay-500 lg:duration-500"
            style={{
              transform: isInView3 ? "none" : "translateX(-200px)",
              opacity: isInView3 ? 1 : 0,
            }}
            ref={ref3}
          >
            <p className="text-center text-4xl font-bold leading-tight text-white lg:text-6xl">
              Go ahaead and <span className="text-indigo-500">explore</span>{" "}
              what we offer to you!
            </p>
            <div>
              <Link href={"/explore"}>
                <button className="rounded-lg bg-indigo-500 p-3 font-semibold text-white lg:text-3xl">
                  Explore
                </button>
              </Link>
            </div>
          </div>
          <div
            className="transition-all delay-200 duration-500 ease-in-out lg:delay-700 lg:duration-700"
            style={{
              transform: isInView3 ? "none" : "translateX(200px)",
              opacity: isInView3 ? 1 : 0,
            }}
            ref={ref3}
          >
            <Image
              src="/undraw_adventure_re_ncqp.svg"
              height={600}
              width={600}
              alt="learning"
            />
          </div>
        </div>
      </main>
      <footer className="flex flex-col justify-between gap-y-12 bg-gradient-to-b from-gray-900 via-black to-black p-4 pt-64 font-slab lg:flex-row lg:p-12 lg:px-24">
        <div className="flex flex-col justify-center gap-y-5 lg:w-1/3">
          <h3 className="text-2xl font-bold text-white">
            <span className="text-indigo-600">Pulth</span>App
          </h3>
          <p className="text-white">
            PulthApp is the new way of learning with free and priced options.
            You can read articles for free that made by our community. Second
            option is you can buy courses that made in a predetermined
            curriculum by verified teachers from our community.
          </p>
          <div className="flex flex-col gap-y-6 text-white">
            <div className="flex items-center gap-x-4">
              <FacebookIcon className="fill-white" />
              <p className="font-semibold">@pulthappfacebook</p>
            </div>
            <div className="flex items-center gap-x-4">
              <TwitterIcon className="fill-white" />
              <p className="font-semibold">@pulthapptwitter</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-y-6 text-white lg:w-1/3 lg:items-center">
          <h3 className="text-2xl font-semibold">Useful Links</h3>
          <Link href={"/explore"} className="cursor-pointer text-sm">
            Explore
          </Link>
          <Link href={"/courses"} className="cursor-pointer text-sm">
            Courses
          </Link>
          <Link href={"/articles"} className="cursor-pointer text-sm">
            Articles
          </Link>
        </div>
        <div className="flex flex-col gap-y-6 text-white lg:w-1/3 lg:items-center">
          <h3 className="text-2xl font-semibold text-white">Contact</h3>
          <div className="flex items-center gap-x-2">
            <MapPinIcon className="h-6 w-6" />
            <p className="text-sm">
              26985 Brighton Lane, Lake Forest, CA 92630.
            </p>
          </div>
          <div className="flex items-center gap-x-2">
            <PhoneIcon className="h-6 w-6" />
            <p className="text-sm">+90 538 865 01 98</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
