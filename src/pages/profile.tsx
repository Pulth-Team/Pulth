import type { NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";

import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo, useReducer } from "react";

import { api } from "~/utils/api";

import {
  Dialog,
  Popover,
  Transition,
  Listbox,
  RadioGroup,
} from "@headlessui/react";
import {
  PlusIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

import Loading from "~/components/Loading";
import DashboardLayout from "~/components/layouts/gridDashboard";
import MyArticleCard from "~/components/editor/MyArticleCard";
const Tour = dynamic(() => import("~/components/Tour"), { ssr: false });

enum OrderType {
  Newest = "Newest",
  Oldest = "Oldest",
  PublishedFirst = "Published",
  UnpublishedFirst = "Unpublished",
}

// objects should be given only if they are excluded from the filter
enum FilterObject {
  Draft = "Draft",
  Published = "Published",
  lastWeek = "lastWeek",
  lastMonth = "lastMonth",
  AllTime = "all",
  // TODO: Add between dates
}

const Articles: NextPage = () => {
  const { status } = useSession({ required: true });

  const [isOpen, setIsOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogDescription, setDialogDescription] = useState("");
  const [selectedOrderType, setOrderType] = useState<OrderType>(
    OrderType.Newest
  );

  // states for filters
  const [filterObjects, modifyFilter] = useReducer(
    (
      state: (FilterObject.Published | FilterObject.Draft)[],
      action: FilterObject.Published | FilterObject.Draft
    ): (FilterObject.Published | FilterObject.Draft)[] => {
      console.log("Modify called with", state, action);
      const isAlreadyAdded = state.includes(action);
      console.log("isAlreadyAdded is", isAlreadyAdded);

      if (isAlreadyAdded) return state.filter((filter) => filter !== action);
      else return [...state, action];
    },
    [FilterObject.Draft, FilterObject.Published]
  );

  // state for date range filter
  // TODO: Add between dates
  const [dateRangeFilter, SetDateRangeFilter] = useState<
    FilterObject.lastMonth | FilterObject.lastWeek | FilterObject.AllTime
  >(FilterObject.AllTime);

  const onSubmitDialog = () => {
    createMutation.mutate({
      title: dialogTitle,
      description: dialogDescription,
    });
  };

  const createMutation = api.article.create.useMutation();

  const articleDataFetch = api.article.getMyArticles.useQuery({
    limit: 9,
    page: 0,
    filters: {
      isPublished: filterObjects.includes(FilterObject.Published),
      isDraft: filterObjects.includes(FilterObject.Draft),
      timePeriod: dateRangeFilter,
    },
  });
  // Ordering the articles based on the selectedOrderType
  useMemo(() => {
    if (!articleDataFetch.data) return;

    articleDataFetch.data.sort((a, b) => {
      switch (selectedOrderType) {
        case OrderType.Newest:
          return b.createdAt.getTime() - a.createdAt.getTime();
        case OrderType.Oldest:
          return a.createdAt.getTime() - b.createdAt.getTime();
        case OrderType.PublishedFirst:
          return b.isPublished ? 1 : -1;
        case OrderType.UnpublishedFirst:
          return b.isPublished ? -1 : 1;
      }
    });
  }, [selectedOrderType, articleDataFetch.data]);

  useEffect(() => {
    if (createMutation.isSuccess) {
      // reseting the mutation state
      // so it wont cause infinite loop
      // because if we dont isSucess will be true
      // and it will cause the useEffect to run again
      // so we would refetch "articleDataFetch" query again and again
      createMutation.reset();

      // refetching the query to get the new articles
      articleDataFetch.refetch();

      // reseting the dialog state
      setDialogDescription("");
      setDialogTitle("");
      setIsOpen(false);
    }
  }, [createMutation, articleDataFetch]);

  return (
    <DashboardLayout>
      <Head>
        <title>Profile - Pulth App</title>
        <meta name="description" content="Your Profile in Pulth" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="p-4">
        {status === "loading" ? (
          <Loading className="mt-4 h-12 w-12 border-2" />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2>
                <span className="text-2xl font-bold">My Articles</span>
              </h2>
              <div className="flex gap-2">
                {/* TODO: Add "New" button */}
                <button
                  onClick={() => setIsOpen(true)}
                  className="flex h-12 items-center justify-center gap-x-2 rounded-lg border border-gray-300 bg-white p-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200"
                >
                  New Article
                  <PlusIcon className="h-6 w-6" />
                </button>

                <Popover className="relative">
                  <Popover.Button>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 ">
                      <AdjustmentsHorizontalIcon className="h-6 w-6" />
                    </div>
                  </Popover.Button>
                  <Transition
                    enter="transition duration-75 ease-in"
                    enterFrom="transform scale-95 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-75 ease-out"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-95 opacity-0"
                  >
                    <Popover.Panel className="absolute right-0  z-10 rounded-lg border border-gray-300 bg-gray-50  p-4 shadow-md">
                      <div className="flex w-64 flex-col">
                        {/* Order Selection */}
                        <div className="flex justify-between ">
                          <p className="text-sm font-medium text-black/70">
                            Order
                          </p>
                          <Listbox
                            value={selectedOrderType}
                            onChange={setOrderType}
                          >
                            <div className="relative w-36 ">
                              <Listbox.Button className={"relative"}>
                                {selectedOrderType}
                              </Listbox.Button>
                              <Listbox.Options
                                className={
                                  "boreder-gray-200 absolute right-0 w-36 rounded border bg-white px-2 py-4"
                                }
                              >
                                {[
                                  OrderType.Newest,
                                  OrderType.Oldest,
                                  OrderType.PublishedFirst,
                                  OrderType.UnpublishedFirst,
                                ].map((orderType) => (
                                  <Listbox.Option
                                    key={orderType}
                                    value={orderType}
                                    className={({ active }) =>
                                      `${
                                        active
                                          ? "bg-indigo-500 text-white"
                                          : "text-gray-900"
                                      }
                                   relative cursor-default select-none rounded px-2`
                                    }
                                  >
                                    {orderType}
                                  </Listbox.Option>
                                ))}
                              </Listbox.Options>
                            </div>
                          </Listbox>
                        </div>
                        <div>
                          <p>Filters</p>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <button
                              onClick={() => {
                                console.log("clicked");
                                if (
                                  filterObjects.length == 2 ||
                                  !filterObjects.includes(FilterObject.Draft)
                                )
                                  modifyFilter(FilterObject.Draft);
                              }}
                              className={`inline whitespace-nowrap rounded border ${
                                filterObjects.includes(FilterObject.Draft)
                                  ? "bg-white"
                                  : "bg-gray-200"
                              } border} p-1
                                p-1`}
                            >
                              Unpublished
                            </button>
                            <button
                              onClick={() => {
                                console.log("clicked");
                                if (
                                  filterObjects.length == 2 ||
                                  !filterObjects.includes(
                                    FilterObject.Published
                                  )
                                )
                                  modifyFilter(FilterObject.Published);
                              }}
                              className={`inline whitespace-nowrap rounded border ${
                                filterObjects.includes(FilterObject.Published)
                                  ? "bg-white"
                                  : "bg-gray-200"
                              } border} p-1
                                p-1`}
                            >
                              Published
                            </button>
                          </div>
                          <p>Date Range</p>
                          <RadioGroup
                            value={dateRangeFilter}
                            onChange={SetDateRangeFilter}
                            as={"div"}
                            className={"flex flex-wrap gap-2 text-sm"}
                          >
                            <RadioGroup.Option
                              value={FilterObject.lastWeek}
                              className={"inline"}
                            >
                              {({ checked }) => (
                                <button
                                  onClick={() => {
                                    console.log("clicked");
                                    SetDateRangeFilter(FilterObject.lastWeek);
                                  }}
                                  className={`inline whitespace-nowrap rounded border ${
                                    checked ? "bg-white" : "bg-gray-200"
                                  } border} p-1
                              p-1`}
                                >
                                  Last Week
                                </button>
                              )}
                            </RadioGroup.Option>

                            <RadioGroup.Option
                              value={FilterObject.lastMonth}
                              className={"inline"}
                            >
                              {({ checked }) => (
                                <button
                                  onClick={() => {
                                    console.log("clicked");
                                    SetDateRangeFilter(FilterObject.lastMonth);
                                  }}
                                  className={`inline whitespace-nowrap rounded border ${
                                    checked ? "bg-white" : "bg-gray-200"
                                  } border} p-1
                                p-1`}
                                >
                                  Last Month
                                </button>
                              )}
                            </RadioGroup.Option>
                            <RadioGroup.Option
                              value={FilterObject.AllTime}
                              className={"inline"}
                            >
                              <button
                                onClick={() => {
                                  console.log("clicked");
                                  SetDateRangeFilter(FilterObject.AllTime);
                                }}
                                className={`inline whitespace-nowrap rounded border ${
                                  dateRangeFilter === FilterObject.AllTime
                                    ? "bg-white"
                                    : "bg-gray-200"
                                } border} p-1
                                p-1`}
                              >
                                All Time
                              </button>
                            </RadioGroup.Option>
                          </RadioGroup>
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </Popover>
              </div>
            </div>
            {articleDataFetch.isLoading ? (
              <Loading className="mt-4 h-12 w-12 border-4" />
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {articleDataFetch.data ? (
                  articleDataFetch.data.map((article) => (
                    <MyArticleCard
                      key={article.slug}
                      title={article.title}
                      description={article.description}
                      slug={article.slug}
                      isPublished={article.isPublished}
                      // TODO: Maybe add an image
                      // image={article.image}
                    />
                  ))
                ) : (
                  <p className="text-center text-gray-500">No articles found</p>
                )}

                {/* Add Project div */}
                {!articleDataFetch.isLoading &&
                  articleDataFetch.data &&
                  articleDataFetch.data.length < 9 && (
                    <button
                      className="group col-span-1 flex flex-col items-center justify-center rounded-md border-2 border-dashed bg-white py-6 hover:border-solid hover:border-indigo-500"
                      onClick={() => setIsOpen(true)}
                      id="create-article-button"
                    >
                      <PlusIcon className="h-6 w-6 group-hover:text-indigo-500"></PlusIcon>
                      <p className="text-sm font-medium leading-6 group-hover:text-indigo-500">
                        Create New Article
                      </p>
                    </button>
                  )}

                {/* TODO: Add Stepper dialog for Tag and topic selection */}
                <Dialog
                  open={isOpen}
                  onClose={() => {
                    if (!createMutation.isLoading) {
                      setIsOpen(false);
                      setDialogDescription("");
                      setDialogTitle("");
                    }
                  }}
                >
                  <div
                    className="fixed inset-0 bg-black/30  backdrop-blur-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                  />
                  <div className="fixed inset-0 flex items-center justify-center  ">
                    <Dialog.Panel className="w-11/12 rounded-2xl bg-white p-4 lg:w-2/5">
                      <Dialog.Title className="text-xl font-bold">
                        Create new article
                      </Dialog.Title>
                      <Dialog.Description className={"text-sm font-light"}>
                        Enter a name and a description for your new article.
                      </Dialog.Description>
                      <div>
                        <label
                          htmlFor="articleName"
                          className="mt-4 block"
                          title="Title is required"
                        >
                          Title{" "}
                          <span className="italic text-red-500 underline">
                            *
                          </span>
                        </label>
                        <input
                          name="articleName"
                          type="text"
                          className="peer w-full rounded-lg border border-gray-200 p-2"
                          value={dialogTitle}
                          onChange={(e) => setDialogTitle(e.target.value)}
                          maxLength={100}
                          minLength={12}
                          required
                          // aria fields for accessibility
                          aria-invalid={
                            dialogTitle.length < 12 || dialogTitle.length > 100
                          }
                          aria-describedby="articleNameError"
                          aria-errormessage="Article's name must be between 12 and 100 characters long."
                        />
                        <p
                          id="articleNameError"
                          className="text-sm font-light text-red-500 peer-valid:hidden peer-invalid:block peer-focus-visible:hidden "
                        >
                          Article&apos;s name must be between 12 and 100
                          characters long.
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="articleDescription"
                          className="mt-4 block"
                          title="Description is required"
                        >
                          Description{" "}
                          <span className="italic text-red-500 underline">
                            *
                          </span>
                        </label>
                        <textarea
                          name="articleDescription"
                          className="peer w-full rounded-lg border border-gray-200 p-2 "
                          value={dialogDescription}
                          onChange={(e) => setDialogDescription(e.target.value)}
                          maxLength={320}
                          minLength={40}
                          required
                          // aria fields for accessibility
                          aria-invalid={
                            dialogTitle.length < 40 || dialogTitle.length > 320
                          }
                          aria-describedby="articleDescriptionError"
                          aria-errormessage="Article's description must be between 40 and 320 characters long."
                        ></textarea>
                        <p
                          id="articleDescriptionError"
                          className="text-sm font-light text-red-500 peer-valid:hidden peer-invalid:block peer-empty:hidden peer-focus:hidden"
                        >
                          Article&apos;s description must be between 40 and 320
                          characters long.
                        </p>
                      </div>

                      <div className="mt-4 flex flex-row justify-between">
                        <button
                          className="mr-auto"
                          onClick={() => {
                            setDialogDescription("");
                            setDialogTitle("");
                            setIsOpen(false);
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          className="flex flex-row items-center justify-center gap-1 rounded-md bg-indigo-500 p-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:bg-indigo-300"
                          onClick={() => onSubmitDialog()}
                          disabled={
                            createMutation.isLoading ||
                            dialogTitle.length < 12 ||
                            dialogDescription.length < 40
                          }
                        >
                          {createMutation.isLoading ? (
                            <Loading className="h-6 w-6 border-4" />
                          ) : (
                            ""
                          )}
                          Continue
                        </button>
                      </div>
                    </Dialog.Panel>
                  </div>
                </Dialog>
              </div>
            )}
          </>
        )}
      </div>
      <Tour
        className="w-96"
        start={"redirect"}
        onFinished={(e, message) => {
          if (e === "error") console.error(message);
        }}
        tours={[
          {
            targetQuery: "#create-article-button",
            message:
              "Click here to create a new article. You can also create a new article by clicking the 'New Article' button in the top right corner.",
            direction: "bottom",
            align: "start",
            className: "my-5",
          },
        ]}
      />
    </DashboardLayout>
  );
};

export default Articles;
