// imports GetServerSideProps from nextjs
import { NextPage } from "next";
import Link from "next/link";
import React, {
  Children,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import { BatchElement } from "../types/renderer";

function isHidden(el: HTMLElement) {
  //   var style = window.getComputedStyle(el);
  //   return style.display === "none";
  return el.offsetParent === null;
}

function calculatePositionLeft(
  targetPosition: DOMRect,
  direction: "top" | "bottom" | "left" | "right",
  align: "start" | "center" | "end",
  tourWidth: number
) {
  if (direction === "bottom" || direction === "top") {
    switch (align) {
      case "start":
        return targetPosition.left;
      case "center":
        return targetPosition.left - tourWidth / 2 + targetPosition.width / 2;
      case "end":
        return targetPosition.left - tourWidth + targetPosition.width;
    }
  }

  if (direction === "left") {
    return targetPosition.left - tourWidth;
  }

  if (direction === "right") {
    return targetPosition.left + targetPosition.width;
  }
}

function calculatePositionTop(
  targetPosition: DOMRect,
  direction: "top" | "bottom" | "left" | "right",
  align: "start" | "center" | "end",
  tourHeight: number
) {
  if (direction === "left" || direction === "right") {
    switch (align) {
      case "start":
        return targetPosition.top;
      case "center":
        return targetPosition.top - tourHeight / 2 + targetPosition.height / 2;
      case "end":
        return targetPosition.top - tourHeight + targetPosition.height;
    }
  }

  if (direction === "top") {
    return targetPosition.top - tourHeight;
  }

  if (direction === "bottom") {
    return targetPosition.top + targetPosition.height;
  }
}

// creates a NextFunctionComponent
const Tour: NextPage<{
  start: boolean;
  tourClassNames?: string[];
  className?: string;

  targetQueries: string[];
  directions: ("top" | "bottom" | "left" | "right")[];
  aligns: ("start" | "center" | "end")[];
  messages: string[];

  onFinished: (e: "success" | "backdrop" | "skipped" | "error") => void;
}> = ({
  start,

  tourClassNames,
  className,

  targetQueries,
  directions,
  aligns,
  messages,

  onFinished,
}) => {
  const tourRef = useRef<HTMLDivElement>(null);
  const [lastTarget, setLastTarget] = useState<HTMLElement | null>(null);
  const [tourIndex, setTourIndex] = useState(0);

  const clearTour = (e: "success" | "backdrop" | "skipped" | "error") => {
    lastTarget?.style.setProperty("z-index", "auto");
    setTourIndex(0);
    setLastTarget(null);
    onFinished(e);
  };

  // checks if the length of the targetQueries, directions, messages and aligns are equal
  if (
    targetQueries.length !== directions.length ||
    directions.length !== messages.length ||
    messages.length !== aligns.length
  ) {
    console.error(
      "targetQueries, directions, messages and aligns must have the same length"
    );

    return null;
  }

  useLayoutEffect(() => {
    if (!start) return clearTour("error");

    // gets the first query and direction
    const currentQuery = targetQueries[tourIndex];
    const currentDirection = directions[tourIndex];
    const currentAlign = aligns[tourIndex];

    if (!currentQuery || !currentDirection || !currentAlign) {
      console.error("Query, direction or Align are null");

      return clearTour("error");
    }

    // gets the target element
    const targetAll = document.querySelectorAll<HTMLElement>(currentQuery);

    // checks if the target is null
    if (!targetAll) {
      console.error("target is null");

      return clearTour("error");
    }

    let visibleTarget: HTMLElement | null = null;
    if (targetAll.length > 1) {
      // checks if the target is an array

      const targetArray = Array.from(targetAll);
      console.log("target is an array calculating the first visible element");

      // loops through the array
      const filteredVisibleTargets = targetArray.filter((target) => {
        return !isHidden(target);
      });

      if (filteredVisibleTargets.length > 0)
        visibleTarget =
          filteredVisibleTargets[0] === undefined
            ? null
            : filteredVisibleTargets[0];
    }
    const target = visibleTarget || targetAll[0];

    if (!target) {
      console.error("target is null");

      return clearTour("error");
    }

    // calculates the position of the target element
    const targetPosition = target?.getBoundingClientRect();

    if (!targetPosition) {
      console.error("target position is null");
      return clearTour("error");
    }

    // calculates tours height and width
    const tourHeight = tourRef.current?.getBoundingClientRect().height;
    const tourWidth = tourRef.current?.getBoundingClientRect().width;

    // checks if tour height or width is null
    if (typeof tourHeight !== "number" || typeof tourWidth !== "number") {
      console.error("tour height or width is null", tourHeight, tourWidth);

      return clearTour("error");
    }

    tourRef.current?.style.setProperty(
      "left",
      `${calculatePositionLeft(
        targetPosition,
        currentDirection,
        currentAlign,
        tourWidth
      )}px`
    );

    tourRef.current?.style.setProperty(
      "top",
      `${calculatePositionTop(
        targetPosition,
        currentDirection,
        currentAlign,
        tourHeight
      )}px`
    );

    // desets the z-index of the last target
    lastTarget?.style.setProperty("z-index", "auto");

    // sets the z-index of the tour element
    tourRef.current?.style.setProperty("z-index", "50");
    target?.style.setProperty("z-index", "50");

    // sets the last target
    setLastTarget(target);

    // checks if the tour index is equal to the length of the target queries
    if (tourIndex === targetQueries.length) {
      clearTour("success");
    }
  }, [tourIndex, start]);

  return (
    <>
      <div
        className={`
        bg-white rounded shadow-md z-50 p-2 
        ${className}
        ${tourClassNames && tourClassNames[tourIndex]}  ${start || "hidden"}
        absolute `}
        ref={tourRef}
      >
        {messages[tourIndex]}

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
