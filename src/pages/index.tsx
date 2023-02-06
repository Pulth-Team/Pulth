import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { trpc } from "../utils/trpc";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import FacebookIcon from "../components/icons/FacebookIcon";
import TwitterIcon from "../components/icons/TwitterIcon";
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
      <nav className="bg-slate-800 w-full flex p-4 align-middle items-center sticky top-0 z-20">
        <span className="text-indigo-500 text-2xl font-bold mr-auto self-stretch my-auto">
          PulthApp
        </span>
        <div className="flex items-center gap-x-8">
          <button className="text-white p-2 text-xl font-semibold">
            Explore
          </button>
          <button className="text-white p-2 text-xl font-semibold">
            Courses
          </button>
          <button className="text-white p-2 text-xl font-semibold">
            Articles
          </button>
          <button className="text-indigo-500 p-2 rounded text-xl font-bold">
            Join Now!
          </button>
        </div>
      </nav>
      <main className="flex flex-col overflow-x-hidden">
        <div className="flex justify-between px-16 items-center bg-gray-900 h-screen">
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
          >
            <div className="flex flex-col h-full p-8 gap-y-5 font-slab tracking-tighter w-3/4 justify-center">
              <p className="text-6xl text-white font-bold leading-tight">
                <span className="text-indigo-500">Pulth</span> is the new way of
                learning.
                <br />
                Now it&apos;s your time to{" "}
                <span className="text-indigo-500">learn</span> with quality!
              </p>
              <div>
                <button className="text-white text-3xl p-3 bg-indigo-500 font-semibold rounded-lg">
                  Join for free
                </button>
              </div>
            </div>
          </motion.div>
          <motion.div
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
        </div>
        <div className="flex flex-row-reverse justify-between px-16 pt-16 items-center bg-gray-900 h-screen snap-center">
          <div
            className="flex flex-col h-full p-8 gap-y-5 font-slab tracking-tighter w-3/4 justify-center"
            style={{
              transform: isInView ? "none" : "translateX(200px)",
              opacity: isInView ? 1 : 0,
              transition: isInView
                ? "all 0.5s cubic-bezier(0.17, 0.55, 0.55, 1) 0.6s"
                : "none",
            }}
            ref={ref}
          >
            <p className="text-6xl text-white font-bold leading-tight">
              You can <span className="text-indigo-500">learn for free </span>
              by reading articles written by our community!
            </p>
            <div>
              <button className="text-white text-3xl p-3 bg-indigo-500 font-semibold rounded-lg">
                View Articles
              </button>
            </div>
          </div>
          <div
            ref={ref}
            style={{
              transform: isInView ? "none" : "translateX(-200px)",
              opacity: isInView ? 1 : 0,
              transition: isInView
                ? "all 0.8s cubic-bezier(0.17, 0.55, 0.55, 1) 0.8s"
                : "none",
            }}
          >
            <Image
              src="/undraw_knowledge_re_5v9l.svg"
              height={800}
              width={800}
              alt="learning"
              className="flex flex-col h-full p-8 gap-y-5 font-slab tracking-tighter w-3/4 justify-center"
            />
          </div>
        </div>
        <div className="flex flex-row justify-between px-16 pt-16 items-center bg-gray-900 h-screen">
          <div
            className="flex flex-col h-full p-8 gap-y-5 font-slab tracking-tighter w-3/4 justify-center"
            style={{
              transform: isInView2 ? "none" : "translateX(-200px)",
              opacity: isInView2 ? 1 : 0,
              transition: isInView2
                ? "all 0.5s cubic-bezier(0.17, 0.55, 0.55, 1) 0.6s"
                : "none",
            }}
            ref={ref2}
          >
            <p className="text-6xl text-white font-bold leading-tight">
              We are giving you the privilege of learning from
              <span className="text-indigo-500"> verified teachers </span>
              chosen by our algorithm!
            </p>
            <div>
              <button className="text-white text-3xl p-3 bg-indigo-500 font-semibold rounded-lg">
                View Courses
              </button>
            </div>
          </div>
          <div
            style={{
              transform: isInView2 ? "none" : "translateX(200px)",
              opacity: isInView2 ? 1 : 0,
              transition: isInView2
                ? "all 0.8s cubic-bezier(0.17, 0.55, 0.55, 1) 0.8s"
                : "none",
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
        <div className="flex flex-col justify-center px-16 items-center bg-gray-900 h-fit">
          <div
            className="flex flex-col p-4 pb-0 gap-y-6 font-slab tracking-tighter h-fit justify-center items-center"
            style={{
              transform: isInView3 ? "none" : "translateX(-200px)",
              opacity: isInView3 ? 1 : 0,
              transition: isInView3
                ? "all 0.5s cubic-bezier(0.17, 0.55, 0.55, 1) 0.6s"
                : "none",
            }}
            ref={ref3}
          >
            <p className="text-6xl text-white font-bold leading-tight text-center">
              Go ahaead and <span className="text-indigo-500">explore</span>{" "}
              what we offer to you!
            </p>
            <div>
              <button className="text-white text-3xl p-3 bg-indigo-500 font-semibold rounded-lg">
                Explore
              </button>
            </div>
          </div>
          <div
            style={{
              transform: isInView3 ? "none" : "translateX(200px)",
              opacity: isInView3 ? 1 : 0,
              transition: isInView3
                ? "all 0.5s cubic-bezier(0.17, 0.55, 0.55, 1) 0.6s"
                : "none",
            }}
            ref={ref3}
          >
            <Image
              src="/undraw_adventure_re_ncqp.svg"
              height={500}
              width={600}
              alt="learning"
            />
          </div>
        </div>
      </main>
      <footer className="bg-gradient-to-b from-gray-900 via-black to-black flex justify-between p-12 px-24 pt-64 font-slab">
        <div className="flex flex-col w-1/3 justify-center gap-y-5">
          <h3 className="text-white text-2xl font-bold">
            <span className="text-indigo-600">Pulth</span>App
          </h3>
          <p className="text-white">
            PulthApp is the new way of learning with free and priced options.
            You can read articles for free that made by our community. Second
            option is you can buy courses that made in a predetermined
            curriculum by verified teachers from our community.
          </p>
          <div className="flex flex-col text-white gap-y-6">
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
        <div className="flex flex-col w-1/3 items-center text-white gap-y-6">
          <h3 className="text-2xl font-medium">Useful Links</h3>
          <a className="cursor-pointer text-lg">Explore</a>
          <a className="cursor-pointer text-lg">Courses</a>
          <a className="cursor-pointer text-lg">Articles</a>
        </div>
        <div className="flex flex-col w-1/3 items-center text-white gap-y-6">
          <h3 className="text-white text-2xl font-medium">Contact</h3>
          <div className="flex gap-x-2 items-center">
            <MapPinIcon className="w-6 h-6" />
            <p className="text-lg">
              26985 Brighton Lane, Lake Forest, CA 92630.
            </p>
          </div>
          <div className="flex gap-x-2 items-center">
            <PhoneIcon className="w-6 h-6" />
            <p className="text-lg">+90 538 865 01 98</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
