// imports GetServerSideProps from nextjs
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useRef, useState, useLayoutEffect } from "react";

import { twMerge } from "tailwind-merge";
import { calculatePositionLeft, calculatePositionTop } from "./helpers/Tour";

///
/// Tour Component
///  - This component is used to create a tour for the new users of the app
///  - This component is used in the dashboard.tsx page
///
///  [ ] - add event based next action
///  [ ]   - for example if user clicks to highlighted target then go to next step
///  [ ] - add indicator for the current step
///  [ ] - add indicator for the total steps
///  [ ] - give handler to the parent component to handle the tour
///  [ ]   - for example parent may want to skip some steps according to the user's knowledge
///  [X] - add MultiPage support

type StartProps =
  | {
      start: boolean;
      onClosed: () => void;
    }
  | {
      start: "redirect";
      onClosed?: () => void;
    };

// creates a NextFunctionComponent
const Tour: NextPage<
  {
    className?: string;
    tours: {
      targetQuery: string;
      message: string;

      //optionals
      skip?: boolean;
      redirect?: string;

      // default is bottom
      direction?: "top" | "bottom" | "left" | "right";
      // default is center
      align?: "start" | "center" | "end";
      className?: string;
    }[];
    onFinished?: (
      e: "success" | "backdrop" | "skipped" | "error" | "redirect",
      message?: string
    ) => void;
  } & StartProps
> = ({ start, className, tours, onFinished, onClosed }) => {
  // creates a ref for the content model
  const contentRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const [tourIndex, setTourIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(
    start === "redirect" ? true : start
  );
  const currentTour = tours[tourIndex];

  useLayoutEffect(() => {
    // if (start === false || start !== "redirect" || router.query.tour !== "true") return;
    if (start === false) return;
    if (start === "redirect" && router.query.tour !== "true") return;

    if (!currentTour) return;

    // creates id for the backdrop element targetQuery will be alphanumerical
    const backdropId =
      "tour-backdrop-" + currentTour.targetQuery.replace(/\W+/g, "");

    let backdropTemp: HTMLElement | null = null;

    // finds the target element
    const target = document.querySelector<HTMLElement>(currentTour.targetQuery);
    if (!target) {
      if (onFinished) onFinished("error", "Target element not found");
      if (start === "redirect") router.query.tour = "";
      return;
    }

    // FIX: if the backdrop is already exists then do not create a new one, just use the existing one
    const backdropQuery = target?.parentNode?.querySelector<HTMLElement>(
      "#" + backdropId
    );

    if (backdropQuery) {
      console.warn("backdrop exists");
      backdropTemp = backdropQuery;
      // remove previous display:none; style
      backdropTemp.style.display = "";
    } else {
      backdropTemp = document.createElement("div");
      backdropTemp.id = backdropId;
      backdropTemp.classList.add(
        "fixed",
        "inset-0",
        "bg-black",
        "bg-opacity-50",
        "backdrop-blur-sm",
        "backdrop-brightness-50"
      );

      backdropTemp.onclick = (e) => {
        // if the user clicks to the backdrop then remove the div element
        if (e.target === backdropTemp) {
          target!.style.zIndex = ""; // Reset the z-index of the important element
          backdropTemp!.style.display = "none";
          if (onFinished) onFinished("backdrop");
          setTourIndex(0);
          if (start === "redirect") {
            router.query.tour = "";
            setIsRunning(false);
          }
        }
      };
      target.parentNode?.insertBefore(backdropTemp, target);
    }
    // adds the div element to the parent of a target element
    const backdrop: HTMLElement = backdropTemp;
    // target.parentNode?.insertBefore(contentRef.current!, target);

    // for testing
    // target!.style.backgroundColor = "red";
    target.style.position = "relative";
    target.style.zIndex = "10001";

    backdrop.style.display = "block";
    backdrop.style.zIndex = "10000";

    contentRef.current!.style.display = "block";
    contentRef.current!.style.zIndex = "10001";

    const { width, height } = contentRef.current!.getBoundingClientRect();

    const left = calculatePositionLeft(
      target.getBoundingClientRect(),
      currentTour.direction || "bottom",
      currentTour.align || "center",
      width
    );
    const top = calculatePositionTop(
      target.getBoundingClientRect(),
      currentTour.direction || "bottom",
      currentTour.align || "center",
      height
    );

    contentRef.current!.style.left = left + "px";
    contentRef.current!.style.top = top + "px";

    console.log(backdrop);

    let varyingNode = contentRef.current!;
    return () => {
      console.log("removed Tour");
      target.style.zIndex = ""; // Reset the z-index of the target element
      backdrop.style.display = "none"; // hide the backdrop

      target.style.backgroundColor = ""; // Reset the background color of the target element

      // reset the style of the content element
      varyingNode.style.display = "";
      varyingNode.style.left = "";
      varyingNode.style.top = "";
      varyingNode.style.zIndex = "";

      // remove the div element from the parent of a target element
      // target.parentNode?.removeChild(backdrop);
    };
  }, [start, currentTour, onFinished, tourIndex, router.query, isRunning]);
  if (!currentTour) return null;

  return (
    <div
      className={twMerge(
        "fixed rounded bg-white p-2 shadow-md",
        start === false && "hidden",
        (start === "redirect" && router.isReady && router.query.tour) ||
          "hidden",
        className,
        currentTour!.className
      )}
      ref={contentRef}
    >
      {currentTour!.message}
      <hr className="mb-1 mt-2" />
      <div className="mx-4 my-1 flex justify-between">
        <button
          onClick={() => {
            // close
            if (onClosed) onClosed();
            if (onFinished) onFinished("skipped");
            setTourIndex(0);
            if (start === "redirect") router.query.tour = "";
          }}
          className={"text-black/70 " + (currentTour?.skip ? "" : "hidden")}
        >
          Skip
        </button>

        {tours[tourIndex]?.redirect ? (
          <Link
            href={{
              pathname: tours[tourIndex]?.redirect,
              query: { tour: true },
            }}
            className={
              "font-semibold" + (tours[tourIndex]?.skip ? "" : " ml-auto")
            }
          >
            Next Tour
          </Link>
        ) : (
          <button
            onClick={() => {
              setTourIndex(tourIndex + 1);
              if (tours.length <= tourIndex + 1) {
                if (onClosed) onClosed();
                if (onFinished) onFinished("success");
                if (start === "redirect") {
                  router.query.tour = "";
                  setIsRunning(false);
                }
                setTourIndex(0);
              }
            }}
            className={
              "font-semibold" + (tours[tourIndex]?.skip ? "" : " ml-auto")
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
