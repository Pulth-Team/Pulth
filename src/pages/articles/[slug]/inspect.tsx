import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import DashboardLayout from "~/components/layouts/gridDashboard";
import Loading from "~/components/Loading";
import { trpc } from "~/utils/trpc";

import { Dialog, Tab, Transition } from "@headlessui/react";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import {
  ArrowUturnLeftIcon,
  CheckCircleIcon,
  PencilIcon,
  PencilSquareIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const Inspect: NextPage = () => {
  const { data, status } = useSession({ required: true });

  const router = useRouter();
  const { slug } = router.query;

  const articleData = trpc.useQuery([
    "article.getArticleBySlugAuthor",
    { slug: slug as string },
  ]);

  const [titleValue, setTitleValue] = useState(articleData.data?.title);
  const [descValue, setDescValue] = useState(articleData.data?.description);
  const [titleResetButton, setTitleResetButton] = useState(false);
  const [descResetButton, setDescResetButton] = useState(false);
  const [deleteArticleModal, setDeleteArticleModal] = useState(false);
  const [keywords, setKeywords] = useState([] as string[]);
  const [deleteTitleInput, setDeleteTitleInput] = useState("");
  const [inputError, setInputError] = useState(false);

  const deleteArticle = trpc.useMutation("article.deleteArticleBySlug");
  const publishArticleMutation = trpc.useMutation("article.publishArticle");

  const handleDeleteButton = () => {
    if (deleteTitleInput == articleData.data?.title) {
      deleteArticle.mutate({ slug: slug as string });
      setDeleteArticleModal(false);
      router.push("/profile");
    } else {
      setInputError(true);
    }
  };

  useEffect(() => {
    setTitleValue(articleData.data?.title);
    setDescValue(articleData.data?.description);
  }, [
    articleData.isFetched,
    articleData.data?.title,
    articleData.data?.description,
  ]);

  const saveArticle = trpc.useMutation("article.updateArticleCredidantials");

  let body;

  const [keywordInput, setKeywordInput] = useState("");
  const [keywordError, setKeywordError] = useState("");

  let keywordList = (
    <div className="gap-4 flex flex-wrap">
      {keywords.map((keyword) => (
        <div
          className="group flex bg-indigo-500 text-white rounded-full p-2 gap-x-2 justify-between items-center"
          key={keyword}
        >
          <p className="min-h-0 leading-none text-sm">{keyword}</p>
          <XMarkIcon
            className="h-4 w-4 cursor-pointer opacity-0 group-hover:opacity-100"
            onClick={() => {
              setKeywords((prev) => prev.filter((k) => k !== keyword));
            }}
          />
        </div>
      ))}
      <div className="flex gap-x-4 gap-y-1 align-middle w-full flex-wrap">
        <input
          className="border rounded-md p-2"
          onChange={(e) => setKeywordInput(e.target.value)}
          value={keywordInput}
        />
        <button
          className="bg-indigo-500 rounded-md p-1"
          onClick={() => {
            // check if keyword already exists
            if (keywords.length > 10) {
              setKeywordError("You can only have 10 keywords.");
              return;
            }

            if (keywordInput.length < 3 || keywordInput.length > 20) {
              setKeywordError("Keyword must be between 3 and 20 characters");
              return;
            }

            // check if keyword already exists
            if (keywords.includes(keywordInput)) {
              setKeywordError("You already have this keyword.");
              return;
            }

            // accept only alphanumeric characters
            if (!/^[a-zA-Z0-9]+$/.test(keywordInput)) {
              setKeywordError("Keyword must be alphanumeric.");
              return;
            }

            setKeywords(keywords.concat(keywordInput));
            setKeywordInput("");
            setKeywordError("");
          }}
        >
          <CheckCircleIcon className="h-7 w-7 stroke-white" />
        </button>
        <label className="text-sm italic text-red-500 w-full">
          {keywordError}
        </label>
      </div>
      <button
        className="flex items-center gap-x-2 bg-indigo-500 p-2 rounded-md text-white"
        onClick={() => {
          saveArticle.mutate(
            {
              slug: slug as string,
              title: titleValue || "",
              description: descValue || "",
            },
            {
              onSuccess: (data) => {
                if ("slug" in data) {
                  setDescResetButton(false);
                  setTitleResetButton(false);
                  router.replace(`/articles/${data.slug}/inspect`);
                }
              },
            }
          );
        }}
      >
        <p>Save Changes</p>
      </button>
    </div>
  );

  if (status === "authenticated" && articleData.isFetched) {
    dayjs.extend(relativeTime);
    let updatedDate = dayjs(articleData.data?.updatedAt).fromNow();

    body = (
      <div className="w-full flex items-start justify-between py-16 px-12 ">
        <div className="p-2 w-4/6">
          <div className="mb-8">
            {/* add breadcrumb */}
            <div className=" text-black/70 text-sm">Inspect Article</div>
            <h1 className="text-2xl ">{articleData.data?.title}</h1>
            <hr className="my-2" />
            <p>
              Here, you can view and analyze various aspects of your article.
              You can see the title, author, date published, as well as any
              keywords, tags, images, or ratings it has been assigned. You can
              also see the length of the article and how long it would take to
              read. Use this page to gain insights into your article and make
              any necessary updates or changes.
            </p>
          </div>
          {/* TODO: analytics section here */}

          <Tab.Group>
            <Tab.List className="flex gap-x-4 border-b-2 ">
              <Tab
                className={`ui-selected:border-b-2 ui-selected:translate-y-0.5 ui-not-selected:text-black/70 border-b-gray-400 outline-none text-lg`}
              >
                Settings
              </Tab>
              <Tab
                className={`ui-selected:border-b-2 ui-selected:translate-y-0.5 ui-not-selected:text-black/70 border-b-gray-400 outline-none text-lg`}
              >
                SEO
              </Tab>
              {/* a section for who can read (subs, followers, premiums etc.) */}
            </Tab.List>
            <Tab.Panels className={"mt-4 "}>
              <Tab.Panel className={"outline-none"}>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center relative">
                    <div className="text-lg self-start mr-auto">Title</div>
                    <input
                      type="text"
                      className="border-2 border-gray-300 rounded-md px-2 py-1"
                      onChange={(e) => {
                        setTitleValue(e.target.value);
                        setTitleResetButton(true);
                        if (e.target.value === articleData.data?.title)
                          setTitleResetButton(false);
                      }}
                      value={titleValue}
                    />

                    <button
                      onClick={() => {
                        setTitleValue(articleData.data?.title);
                        setTitleResetButton(false);
                      }}
                      className={`${
                        titleResetButton ? "block" : "hidden"
                      } select-none  bg-indigo-500 p-1 rounded-md absolute -right-10 `}
                    >
                      <XCircleIcon className="stroke-white h-6 w-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between relative ">
                    <div className="text-lg self-start">Description</div>
                    <div className="flex flex-col gap-y-4 w-2/3">
                      <textarea
                        onChange={(e) => {
                          setDescValue(e.target.value);
                          setDescResetButton(true);
                          if (e.target.value === articleData.data?.description)
                            setDescResetButton(false);
                        }}
                        className="border-2 border-gray-300 rounded-md px-2 py-1 max-h-36 min-h-[96px] w-full"
                        value={descValue}
                      />
                    </div>

                    <button
                      onClick={() => {
                        setDescValue(articleData.data?.description);
                        setDescResetButton(false);
                      }}
                      className={`${
                        descResetButton ? "block" : "hidden"
                      } select-none  bg-indigo-500 p-1 rounded-md absolute -right-10 `}
                    >
                      <XCircleIcon className="stroke-white h-6 w-6" />
                    </button>
                  </div>
                  <hr className="my-2" />
                  <button
                    disabled={!descResetButton && !titleResetButton}
                    className="flex gap-2 bg-indigo-500 text-white text-lg rounded-md px-2 py-1 ml-auto disabled:bg-transparent disabled:border disabled:border-gray-700 disabled:text-gray-700 transition-colors duration-200"
                    onClick={async () => {
                      saveArticle.mutate(
                        {
                          slug: slug as string,
                          title: titleValue || "",
                          description: descValue || "",
                        },
                        {
                          onSuccess: (data) => {
                            if ("slug" in data) {
                              setDescResetButton(false);
                              setTitleResetButton(false);
                              router.replace(`/articles/${data.slug}/inspect`);
                            }
                          },
                        }
                      );
                    }}
                  >
                    {saveArticle.isLoading && (
                      <Loading className="h-6 w-6 border-2" />
                    )}
                    Save Changes
                  </button>
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div>
                  <h1 className="text-2xl font-semibold mb-4">Keywords</h1>
                  {keywordList}
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>

        <div className=" flex flex-col gap-2 w-64 p-4 rounded-md bg-white shadow-md">
          <div className=" text-xl">Actions</div>
          <hr />

          {/* Add view count, read time etc */}
          <div className="flex items-baseline justify-between">
            <button
              className="px-2 p-1 rounded bg-indigo-500 text-white flex gap-2"
              onClick={() => {
                publishArticleMutation.mutate(
                  {
                    slug: slug as string,
                    isPublishEvent: !articleData.data?.isPublished,
                  },
                  {
                    onSuccess: (data) => {
                      articleData.refetch();
                    },
                  }
                );
              }}
            >
              {publishArticleMutation.isLoading ? (
                <Loading className="h-6 w-6 border-2" />
              ) : null}
              {!articleData.data?.isPublished ? "Publish" : "Unpublish"}
            </button>
            <div>{updatedDate}</div>
          </div>

          <button
            onClick={() => setDeleteArticleModal(true)}
            className="select-none font-semibold text-center py-1 rounded-md border-gray-300 border-2 bg-white text-red-500 hover:bg-red-500 hover:border-red-500 active:bg-red-700 active:border-red-700 active:text-white hover:text-white"
          >
            Delete
          </button>
          <Link href={`/articles/${slug}/edit`}>
            <div className="select-none font-semibold text-center py-1 rounded-md border-gray-300 border-2 bg-white hover:text-white hover:bg-indigo-500 hover:border-indigo-500  active:bg-indigo-700 active:border-indigo-700 active:text-white">
              Edit
            </div>
          </Link>
        </div>
        <Transition appear show={deleteArticleModal} as={Fragment}>
          <Dialog
            open={deleteArticleModal}
            onClose={() => setDeleteArticleModal(false)}
            className="z-20 relative"
            as="div"
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-50"></div>
            </Transition.Child>
            <div className="fixed inset-0">
              <div className="flex justify-center items-center h-full">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Dialog.Panel className="bg-white rounded-md p-4 flex flex-col gap-y-4">
                    <Dialog.Title className="text-xl font-semibold">
                      Delete Article
                    </Dialog.Title>
                    <div className="flex flex-col">
                      <label className="mb-2">
                        To delete your article write the name of you article
                        below
                      </label>
                      <label className="italic text-black/50 text-sm ">
                        {articleData.data?.title}
                      </label>
                      <input
                        placeholder="Article Name"
                        className={`${
                          inputError
                            ? "border-red-500"
                            : "focus:border-indigo-500"
                        } p-2 rounded-lg border-2 focus:ring-0 focus:outline-none`}
                        onChange={(e) =>
                          setDeleteTitleInput(e.target.value.toString())
                        }
                      ></input>
                      <label
                        className={`${
                          inputError ? "opacity-100" : " opacity-0"
                        } text-sm text-red-500 italic`}
                      >
                        Check your input!
                      </label>
                    </div>
                    <button
                      className="bg-red-500 rounded p-2 text-white w-1/3"
                      onClick={() => handleDeleteButton()}
                    >
                      Delete Article
                    </button>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Inspect Article</title>
      </Head>
      {status === "loading" || articleData.isLoading ? (
        <div className="w-full flex items-center justify-center py-16 ">
          <Loading className="w-14 h-14 border-4 " />
        </div>
      ) : (
        body
      )}
    </DashboardLayout>
  );
};

export default Inspect;
