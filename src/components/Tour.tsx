// imports GetServerSideProps from nextjs
import { NextPage } from "next";
import Link from "next/link";
import React, { useRef, useState, useLayoutEffect, useCallback } from "react";

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
///  [ ] - add MultiPage support

// creates a NextFunctionComponent
const Tour: NextPage<{
  start: boolean;
  className?: string;
  tours: {
    targetQuery: string;
    direction?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
    message: string;
    className?: string;
  }[];
  onFinished: (
    e: "success" | "backdrop" | "skipped" | "error",
    message?: string
  ) => void;
}> = ({ start, className, tours, onFinished }) => {
  const tourRef = useRef<HTMLDivElement>(null);
  const [tourIndex, setTourIndex] = useState(0);
  const [lastTarget, setLastTarget] = useState<HTMLElement | null>(null);

  function setZIndex(target: HTMLElement, zIndex: number | "auto") {
    target.style.setProperty("z-index", zIndex.toString());
  }

  const clearTour = useCallback(
    (e: "success" | "backdrop" | "skipped" | "error", message?: string) => {
      if (lastTarget) {
        setZIndex(lastTarget, "auto");
      }

      setTourIndex(0);
      setLastTarget(null);
      onFinished(e, message);
    },
    [onFinished, lastTarget]
  );

  useLayoutEffect(() => {
    // if tour is not started then return
    if (!start) return;
    // if tour is finished then clear the tour
    if (tourIndex >= tours.length) {
      clearTour("success");
      return;
    }
    // if tour data is not valid then clear the tour with error code
    // if there is no tour element then return
    if (!tourRef.current) return;

    const currentTour = tours[tourIndex];
    if (!currentTour) {
      console.log(currentTour);
      clearTour("error", "Tour data is not valid");
      return;
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
      clearTour("error", "There is no target element");
      return;
    }

    if (!QueryTargets[0]) {
      clearTour("error", "There is no target element");
      return;
    }
    let visibleTarget: HTMLElement;
    // if there is more than one target then clear try to find the target which is not hidden
    if (QueryTargets.length > 1) {
      const visibleTargetArray = Array.from(QueryTargets).filter((target) => {
        return !isHidden(target);
      });

      // if there is no visible target then clear the tour with error code
      if (visibleTargetArray.length === 0) {
        clearTour("error", "There is no visible target");
        return;
      }

      if (!visibleTargetArray[0]) {
        clearTour("error", "There is no visible target");
        return;
      }
      if (visibleTargetArray.length > 1) {
        // if there is more than one visible target then warn the user and use the first one
        console.warn(
          "There is more than one visible target, using the first one"
        );
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

    // - set the position of the tour element
    tourRef.current.style.setProperty("left", left.toString() + "px");
    tourRef.current.style.setProperty("top", top.toString() + "px");

    // resets the z-index of the last target
    if (lastTarget) {
      setZIndex(lastTarget, "auto");
    }

    // - set the z-index of the target element
    setZIndex(visibleTarget, 50);
    setZIndex(tourRef.current, 50);

    // set the last target
    setLastTarget(visibleTarget);
  }, [tourIndex, start, tours, clearTour, lastTarget]);

  return (
    <>
      <div
        className={`
        bg-white rounded shadow-md z-50 p-2 
        ${className}
        ${tours[tourIndex]?.className}  ${start || "hidden"}
        absolute `}
        ref={tourRef}
      >
        {tours[tourIndex]?.message}

        <hr className="mb-1 mt-2" />
        <div className="flex justify-between my-1 mx-4">
          <button
            onClick={() => {
              clearTour("skipped");
            }}
            className="text-black/70"
          >
            Skip
          </button>
          <button
            onClick={() => {
              setTourIndex(tourIndex + 1);
            }}
            className="font-semibold"
          >
            Next Tour
          </button>
        </div>
      </div>
      <div
        id="backdrop-shadow"
        className={`w-screen h-screen backdrop-blur-sm backdrop-brightness-50 absolute top-0 left-0 z-40 ${
          start || "hidden"
        }`}
        onClick={() => clearTour("backdrop")}
      ></div>
    </>
  );
};

// exports it
export default Tour;
