// imports GetServerSideProps from nextjs
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, {
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
  useEffect,
} from "react";

import { twMerge } from "tailwind-merge";

import {
  isHidden,
  calculatePositionLeft,
  calculatePositionTop,
} from "./helpers/Tour";

///
/// Tour Component
///  - This component is used to create a tour for the new users of the app
///  - This component is used in the dashboard.tsx page
///
/// TODOs:
///  [ ] - add event based next action
///  [ ]   - for example if user clicks to highlighted target then go to next step
///  [ ] - add indicator for the current step
///  [ ] - add indicator for the total steps
///  [ ] - give handler to the parent component to handle the tour
///  [ ]   - for example parent may want to skip some steps according to the user's knowledge
///  [X] - add MultiPage support

// creates a NextFunctionComponent
const Tour: NextPage<{
  start: boolean | "redirect";
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
  onFinished: (
    e: "success" | "backdrop" | "skipped" | "error" | "redirect",
    message?: string
  ) => void;
}> = ({ start, className, tours, onFinished }) => {
  const tourRef = useRef<HTMLDivElement>(null);
  const [tourIndex, setTourIndex] = useState(0);
  const [lastTarget, setLastTarget] = useState<HTMLElement | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (start === "redirect") {
      if (!router.isReady) {
        setIsRunning(false);
        return;
      }

      if (router.query.tour === "true" && tourIndex === 0 && !isDone) {
        setIsRunning(true);
        return;
      }

      if (router.query.tour !== "true") {
        setIsRunning(false);
        return;
      }

      // if()
      console.log({ tourIndex, tour: router.query.tour });
      // setIsRunning(false);
    } else {
      setIsRunning(start);
    }
  }, [router.isReady, router.query, start, tourIndex]);

  function setZIndex(
    target: HTMLElement,
    zIndex: number | undefined = undefined
  ) {
    console.log(target);
    target.style.setProperty("z-index", zIndex ? zIndex.toString() : "");
  }

  const clearTour = useCallback(
    (
      e: "success" | "backdrop" | "skipped" | "error" | "redirect",
      message?: string,
      report: boolean = true
    ) => {
      if (lastTarget) {
        setZIndex(lastTarget);
      }

      setTourIndex(0);
      setLastTarget(null);
      if (report) onFinished(e, message);
      setIsRunning(false);

      if (start === "redirect" && e !== "error") {
        setIsDone(true);
        // router.replace(router.pathname, undefined, { shallow: true });
      }
    },
    [onFinished, lastTarget, router, start]
  );

  useLayoutEffect(() => {
    // if tour is not started then return
    if (!isRunning) return clearTour("error", "Tour is not started", false);
    // if tour is finished then clear the tour
    if (tourIndex >= tours.length) {
      return clearTour("success");
    }
    // if tour data is not valid then clear the tour with error code
    // if there is no tour element then return
    if (!tourRef.current) return;

    const currentTour = tours[tourIndex];
    if (!currentTour) {
      console.log(currentTour);
      return clearTour("error", "Tour data is not valid");
    }
    // resets the z-index of the last target
    if (lastTarget) {
      setZIndex(lastTarget);
    }

    // if alignment is not set then set it to center
    if (!currentTour.align) {
      currentTour.align = "center";
    }
    // if direction is not set then set it to bottom
    if (!currentTour.direction) {
      currentTour.direction = "bottom";
    }

    // if tour is started then
    //  - get the target element
    //  - calculate the position of the tour element according to alignment and direction
    //  - set the position of the tour element
    //  - set the z-index of the target element
    //  - if tour is finished then clear the tour

    // - get the target element
    const QueryTargets = document.querySelectorAll<HTMLElement>(
      currentTour.targetQuery
    );

    // if there is no target then clear the tour with error code
    if (QueryTargets.length === 0) {
      return clearTour("error", "There is no target element", false);
    }

    if (!QueryTargets[0]) {
      return clearTour("error", "The first target element is null");
    }
    let visibleTarget: HTMLElement;
    // if there is more than one target then clear try to find the target which is not hidden
    if (QueryTargets.length > 1) {
      const visibleTargetArray = Array.from(QueryTargets).filter((target) => {
        return !isHidden(target);
      });

      // if there is no visible target then clear the tour with error code
      if (visibleTargetArray.length === 0) {
        return clearTour("error", "There is no visible target");
      }

      if (!visibleTargetArray[0]) {
        return clearTour("error", "There is no visible target");
      }
      if (visibleTargetArray.length > 1) {
        // if there is more than one visible target then warn the user and use the first one
        console.warn(
          "There is more than one visible target, using the first one"
        );
        console.log(visibleTargetArray);
      }

      visibleTarget = visibleTargetArray[0];
    } else {
      visibleTarget = QueryTargets[0];
    }

    // now we have the target element in the visibleTarget variable
    // - calculate the position of the tour element according to alignment and direction

    const targetBounding = visibleTarget.getBoundingClientRect();
    const { width, height } = tourRef.current.getBoundingClientRect();

    const left = calculatePositionLeft(
      targetBounding,
      currentTour.direction,
      currentTour.align,
      width
    );
    const top = calculatePositionTop(
      targetBounding,
      currentTour.direction,
      currentTour.align,
      height
    );
    console.log({ top, left });

    // - set the position of the tour element
    tourRef.current.style.setProperty("left", left.toString() + "px");
    tourRef.current.style.setProperty("top", top.toString() + "px");

    // - set the z-index of the target element
    setZIndex(visibleTarget, 43);
    setZIndex(tourRef.current, 50);

    // set the last target
    setLastTarget(visibleTarget);

    const lastTourRef = tourRef.current;
    return () => {
      if (lastTarget) {
        setZIndex(lastTarget);
      }
      if (lastTourRef) setZIndex(lastTourRef, 50);
    };

    // HACK: this dependency array is not correct
    // FIXME: eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourIndex, isRunning]);
  //  lastTarget, clearTour, tours,

  const showSkip =
    typeof tours[tourIndex]?.skip === "undefined" ? "" : "hidden";
  return (
    <>
      <div
        className={twMerge(
          "bg-white rounded shadow-md z-50 p-2",
          className,
          tours[tourIndex]?.className,
          !isRunning && "hidden",
          "absolute"
        )}
        ref={tourRef}
      >
        {tours[tourIndex]?.message}

        <hr className="mb-1 mt-2" />
        <div className="flex justify-between my-1 mx-4">
          <button
            onClick={() => {
              clearTour("skipped");
              setIsRunning(false);
            }}
            className={"text-black/70 " + showSkip}
          >
            Skip
          </button>

          {tours[tourIndex]?.redirect ? (
            <Link
              href={{
                pathname: tours[tourIndex]?.redirect,
                query: { tour: true },
              }}
              shallow={true}
              passHref
            >
              <a
                className={
                  "font-semibold" + (tours[tourIndex]?.skip ? "" : " ml-auto")
                }
              >
                Next Tour
              </a>
            </Link>
          ) : (
            <button
              onClick={() => {
                setTourIndex(tourIndex + 1);
              }}
              className={
                "font-semibold" + (tours[tourIndex]?.skip ? "" : " ml-auto")
              }
            >
              Next Tour
            </button>
          )}
        </div>
      </div>
      <div
        id="backdrop-shadow"
        className={`w-screen h-screen backdrop-blur-sm backdrop-brightness-50 absolute top-0 left-0 z-40 ${
          isRunning || "hidden"
        }`}
        onClick={() => clearTour("backdrop")}
      ></div>
    </>
  );
};

// exports it
export default Tour;
