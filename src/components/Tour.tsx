// imports GetServerSideProps from nextjs
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useRef, useState, useLayoutEffect } from "react";

import { twMerge } from "tailwind-merge";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "~/../tailwind.config.js";
import {
  calculatePositionLeft,
  calculatePositionTop,
  checkMediaQuery,
  getCurrentTailwindQuery,
  getMostSpecificCondition,
  sortTailwindSizes,
} from "./helpers/Tour";

import type { TailwindQuery, TourCondition, TourProps } from "./helpers/Tour";

const config = resolveConfig(tailwindConfig);
const tailwindScreens = config.theme?.screens;

///
/// Tour Component
///  - This component is used to create a tour for the new users of the app
///  - This component is used in the dashboard.tsx page
///
///  [ ] - add event based next action
///        - for example if user clicks to highlighted target then go to next step
///  [ ] - add indicator for the current step
///  [ ] - add indicator for the total steps
///  [ ] - give handler to the parent component to handle the tour
///        - for example parent may want to skip some steps according to the user's knowledge
///  [ ] - add conditions support (Media Query based)
///  [X] - add MultiPage support
///  [X] - add Media Query support (TailwindCSS)
///  [X] - add conditions support (Boolean based)
//   [ ] - Dictionary for the conditions
//        -  for example:
//           {
//              sm: {
//                align: "start",
//                direction: "top",
//                targetQuery: "#search-button.mobile",
//              },
//              md: {
//                align: "center",
//                direction: "right",
//                targetQuery: "#search-button.desktop",
//              },
//           }

// creates a NextFunctionComponent
const Tour: NextPage<{
  className?: string;
  tours: TourProps[];

  onFinished?: (
    e: "success" | "backdrop" | "skipped" | "error" | "redirect",
    message?: string
  ) => void;
  redirect?: string;
  start: boolean | "redirect";
}> = ({ start, className, tours, redirect, onFinished }) => {
  // creates a ref for the content model
  const contentRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const [tourIndex, setTourIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(
    start === "redirect" ? true : start
  );
  const currentTour = tours[tourIndex];

  if (!tailwindScreens) throw new Error("Tailwind screens are not defined");

  useLayoutEffect(() => {
    //if window isnt defined return
    if (typeof window === "undefined") return;
    // if (start === false || start !== "redirect" || router.query.tour !== "true") return;
    if (start === false) return;
    if (start === "redirect" && router.query.tour !== "true") return;

    if (!currentTour) return;
    const currentMediaQuery = getCurrentTailwindQuery(tailwindScreens || {});

    const currentOptions = currentTour.default;
    // check if there are any conditions for the current tour
    // check tailwind screens are defined (its needed for the conditions)
    if (
      currentTour.mediaQueries &&
      currentTour.mediaQueries.length > 0 &&
      tailwindScreens
    ) {
      const mostSpecificCondition = getMostSpecificCondition(
        currentTour.mediaQueries,
        currentMediaQuery
      );

      // if mostSpecificCondition is undefined then use the default values

      if (mostSpecificCondition) {
        currentOptions.align = mostSpecificCondition.align;
        currentOptions.direction = mostSpecificCondition.direction;

        // if targetQuery is defined then use it
        if (mostSpecificCondition.targetQuery)
          currentOptions.targetQuery = mostSpecificCondition.targetQuery;
        // if className is defined then use it
        if (mostSpecificCondition.className)
          currentOptions.className = mostSpecificCondition.className;
      }
    }
    // if showOn is defined then check if the current screen is in the showOn array
    if (currentTour.showOn && !currentTour.showOn.includes(currentMediaQuery)) {
      // if we should show this tour
      // then increase the tour index and return

      // check if we increased the tour index more than the tours length
      if (tourIndex + 1 >= tours.length) {
        // if we should redirect then redirect
        if (redirect) {
          router.push({
            pathname: redirect,
            query: { tour: true },
          });
        } else {
          // if we did then call the onFinished function
          if (onFinished) onFinished("success");

          if (start === "redirect") {
            router.query.tour = "";
            setIsRunning(false);
          }
          setTourIndex(0);
        }

        // no need to continue to process
        return;
      }

      setTourIndex(tourIndex + 1);
      return;
    }

    // creates id for the backdrop element targetQuery will be alphanumerical
    const backdropId = currentTour.default.targetQuery.replace(
      /[^a-zA-Z0-9]/g,
      ""
    );

    // creates a backdrop element
    const backdrop = document.createElement("div");
    // sets the backdrop id
    backdrop.id = backdropId;
    // sets the backdrop class
    backdrop.className =
      "fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm backdrop-brightness-50";

    // creates a function to handle backdrop click event
    backdrop.addEventListener("click", () => {
      // removes the backdrop
      backdrop.remove();
      // resets the tour index
      setTourIndex(0);
      // sets the Running state to false
      setIsRunning(false);

      // clear the query
      if (start === "redirect") router.query.tour = "";

      // call the onFinished function
      if (onFinished) onFinished("backdrop");
    });

    // gets the target element
    const target = document.querySelector<HTMLElement>(
      currentOptions.targetQuery
    );
    if (!target) {
      if (onFinished) onFinished("error", "Target element not found");
      return;
    }

    // appends the backdrop to the body
    document.body.appendChild(backdrop);

    // sets the display of the content model
    contentRef.current!.style.display = "block";

    // add the className to the content model
    contentRef.current!.className = twMerge(
      contentRef.current!.className,
      currentOptions.className
    );

    // sets the position of the target element
    target.style.position = "relative";
    target.style.zIndex = "1";

    // calculates the position of the content model
    const { width, height } = contentRef.current!.getBoundingClientRect();

    // calculates the position of the content model
    const positionLeft = calculatePositionLeft(
      target.getBoundingClientRect(),
      currentOptions.direction,
      currentOptions.align,
      width
    );

    const positionTop = calculatePositionTop(
      target.getBoundingClientRect(),
      currentOptions.direction,
      currentOptions.align,
      height
    );

    // sets the position of the content model
    contentRef.current!.style.left = positionLeft + "px";
    contentRef.current!.style.top = positionTop + "px";

    const varyingNode = contentRef.current;
    // cleanup function
    return () => {
      // removes the backdrop
      backdrop.remove();
      // sets the display of the content model
      varyingNode!.style.display = "none";

      // sets the position of the target element
      target.style.position = "";
      target.style.zIndex = "";
    };
  }, [
    start,
    currentTour,
    onFinished,
    tourIndex,
    router.query,
    isRunning,
    redirect,
    router,
    tours.length,
  ]);
  if (!currentTour) return null;

  return (
    <div
      className={twMerge(
        "fixed z-50 rounded bg-white p-2 shadow-md",
        start === false && "hidden",
        (start === "redirect" && router.isReady && router.query.tour) ||
          "hidden",
        className
      )}
      ref={contentRef}
    >
      {currentTour.message}
      <hr className="mb-1 mt-2" />
      <div className="mx-4 my-1 flex justify-between">
        <button
          onClick={() => {
            // closes the tour
            if (onFinished) onFinished("skipped");
            setTourIndex(0);
            if (start === "redirect") router.query.tour = "";
          }}
          className={"text-black/70 " + (currentTour?.skipable ? "" : "hidden")}
        >
          Skip
        </button>

        {tourIndex + 1 == tours.length && redirect ? (
          <Link
            href={{
              pathname: redirect,
              query: { tour: true },
            }}
            className={
              "font-semibold" + (tours[tourIndex]?.skipable ? "" : " ml-auto")
            }
          >
            Next Tour
          </Link>
        ) : (
          <button
            onClick={() => {
              setTourIndex(tourIndex + 1);
              if (tours.length <= tourIndex + 1) {
                if (onFinished) onFinished("success");
                if (start === "redirect") {
                  router.query.tour = "";
                  setIsRunning(false);
                }
                setTourIndex(0);
              }
            }}
            className={
              "font-semibold" + (tours[tourIndex]?.skipable ? "" : " ml-auto")
            }
          >
            {tours.length <= tourIndex + 1 ? "Finish Tour" : "Next Tour"}
          </button>
        )}
      </div>
    </div>
  );
};

// exports it
export default Tour;
