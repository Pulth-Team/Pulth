// imports GetServerSideProps from nextjs
import { NextPage } from "next";
import Link from "next/link";
import React, { Children, useMemo, useRef, useState } from "react";
import { text } from "stream/consumers";
import { BatchElement } from "../types/renderer";

// creates a NextFunctionComponent
const Tour: NextPage<{
  start: boolean;
  tourClassNames?: string[];
  className?: string;

  targetQueries: string[];
  directions: ("top" | "bottom" | "left" | "right")[];
  messages: string[];

  onFinished?: (e: "success" | "backdrop" | "skipped") => void;
}> = ({
  start,

  tourClassNames,
  className,

  targetQueries,
  directions,
  messages,

  onFinished,
}) => {
  const tourRef = useRef<HTMLDivElement>(null);
  const [lastTarget, setLastTarget] = useState<HTMLElement | null>(null);
  const [tourIndex, setTourIndex] = useState(0);

  const clearTour = (e: "success" | "backdrop" | "skipped") => {
    lastTarget?.style.setProperty("z-index", "auto");
    setTourIndex(0);
    setLastTarget(null);
    onFinished?.(e);
  };

  // checks if the length of the targetQueries, directions and messages are equal
  if (
    targetQueries.length !== directions.length ||
    directions.length !== messages.length
  ) {
    console.error("targetQueries, directions and messages are not equal");
    return null;
  }

  useMemo(() => {
    if (!start) return null;

    // gets the first query and direction
    const currentQuery = targetQueries[tourIndex];
    const currentDirection = directions[tourIndex];

    if (!currentQuery || !currentDirection) {
      console.error("Query or direction are null");

      clearTour("success");
      return null;
    }

    // gets the target element
    const target = document.querySelector<HTMLElement>(currentQuery);

    // sets the last target
    setLastTarget(target);

    // calculates the position of the target element
    const targetPosition = target?.getBoundingClientRect();

    console.log(targetPosition);

    if (!targetPosition) {
      console.error("target position is null");
      return null;
    }

    // calculates tours height and width
    const tourHeight = tourRef.current?.getBoundingClientRect().height;
    const tourWidth = tourRef.current?.getBoundingClientRect().width;

    // checks if tour height or width is null
    if (typeof tourHeight !== "number" || typeof tourWidth !== "number") {
      console.error("tour height or width is null", tourHeight, tourWidth);

      return null;
    }

    // switch case for the direction of the tour
    switch (currentDirection) {
      case "top":
        tourRef.current?.style.setProperty(
          "top",
          `${targetPosition?.top + window.scrollY - tourHeight}px`
        );
        tourRef.current?.style.setProperty(
          "left",
          `${targetPosition?.left + window.scrollX}px`
        );
        break;
      case "bottom":
        tourRef.current?.style.setProperty(
          "top",
          `${targetPosition?.top + window.scrollY + targetPosition?.height}px`
        );
        tourRef.current?.style.setProperty(
          "left",
          `${targetPosition?.left + window.scrollX}px`
        );
        break;
      case "left":
        tourRef.current?.style.setProperty(
          "top",
          `${targetPosition?.top + window.scrollY}px`
        );
        tourRef.current?.style.setProperty(
          "left",
          `${targetPosition?.left + window.scrollX - tourWidth}px`
        );
        break;
      case "right":
        tourRef.current?.style.setProperty(
          "top",
          `${targetPosition?.top + window.scrollY}px`
        );
        tourRef.current?.style.setProperty(
          "left",
          `${targetPosition?.left + window.scrollX + targetPosition?.width}px`
        );
        break;
      default:
        console.error("direction is not valid");
        break;
    }

    // desets the z-index of the last target
    lastTarget?.style.setProperty("z-index", "auto");

    // sets the z-index of the tour element
    tourRef.current?.style.setProperty("z-index", "50");
    target?.style.setProperty("z-index", "50");
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
