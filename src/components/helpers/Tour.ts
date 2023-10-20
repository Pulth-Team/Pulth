import { NextPage } from "next";
import Link from "next/link";
import React, { useRef, useState, useCallback } from "react";
import { ScreensConfig } from "tailwindcss/types/config";

type TailwindQuery = "sm" | "md" | "lg" | "xl" | "2xl";

type TourCondition = {
  // used for media query conditions
  taildwindQuery: TailwindQuery;

  // if the condition is true then use these values
  align: "start" | "center" | "end";
  direction: "top" | "bottom" | "left" | "right";

  // if the condition is true then use these values
  // if it is not true then use the default values
  targetQuery?: string;
  className?: string;
};

type TourProps = {
  skipable?: boolean;
  showOn?: ("default" | TailwindQuery)[];

  default: {
    direction: "top" | "bottom" | "left" | "right";
    align: "start" | "center" | "end";
    targetQuery: string;

    className?: string;
  };
  mediaQueries?: TourCondition[];
  message: string;
};

function isHidden(el: HTMLElement) {
  let style = window.getComputedStyle(el);
  return el.offsetParent === null || style.display === "none";
}

function checkMediaQuery(query: string) {
  return window.matchMedia(`(min-width: ${query})`).matches;
}

function calculatePositionLeft(
  targetPosition: DOMRect,
  direction: "top" | "bottom" | "left" | "right",
  align: "start" | "center" | "end",
  tourWidth: number
) {
  switch (direction) {
    case "top":
    case "bottom":
      switch (align) {
        case "start":
          return targetPosition.left;
        case "center":
          return targetPosition.left - tourWidth / 2 + targetPosition.width / 2;
        case "end":
          console.log("value end calculated for left positopn");
          return targetPosition.left - tourWidth + targetPosition.width;
      }
    case "left":
      return targetPosition.left - tourWidth;
    case "right":
      return targetPosition.left + targetPosition.width;
  }
}

function calculatePositionTop(
  targetPosition: DOMRect,
  direction: "top" | "bottom" | "left" | "right",
  align: "start" | "center" | "end",
  tourHeight: number
) {
  switch (direction) {
    case "left":
    case "right":
      switch (align) {
        case "start":
          return targetPosition.top;
        case "center":
          return (
            targetPosition.top - tourHeight / 2 + targetPosition.height / 2
          );
        case "end":
          return targetPosition.top - tourHeight + targetPosition.height;
      }
    case "top":
      return targetPosition.top - tourHeight;
    case "bottom":
      return targetPosition.top + targetPosition.height;
  }
}

// TODO: add native css media query support
function getMostSpecificCondition(
  conditions: TourCondition[],
  currentMediaQuery: "default" | TailwindQuery
): TourCondition | undefined {
  // sort the conditions by tailwind size
  // smallest => largest
  const sortedConditions = sortTailwindSizes(conditions);
  //console.log("Sorted Conditions", sortedConditions);

  // get the most specific condition
  let mostSpecificCondition: undefined | TourCondition = undefined;

  // [sm, md], "lg"
  // returns md
  // [sm, md], "sm"
  // returns sm

  // loop through the conditions
  for (const condition of sortedConditions) {
    // check if current media query is a subset of the condition
    if (
      isTailwindQueryLessOrEqual(condition.taildwindQuery, currentMediaQuery)
    ) {
      console.log(
        condition.taildwindQuery,
        " is  less or equal to",
        currentMediaQuery
      );
      // if it is then use this condition
      mostSpecificCondition = condition;
    }
    // if it is not then break
    else {
      console.log(
        condition.taildwindQuery,
        " is bigger then",
        currentMediaQuery
      );
      break;
    }
  }
  return mostSpecificCondition;
}

function getCurrentTailwindQuery(
  tailwindScreens: ScreensConfig
): "default" | TailwindQuery {
  let mostSpecificCondition: "default" | TailwindQuery = "default";

  for (const condition of ["sm", "md", "lg", "xl", "2xl"] as TailwindQuery[]) {
    // convert tailwind query to pixel size
    const pixelSizeOfQuery =
      tailwindScreens[condition as keyof typeof tailwindScreens];
    // check if the condition is true
    if (!checkMediaQuery(pixelSizeOfQuery.toString())) break;

    // if the condition is true then use these values
    mostSpecificCondition = condition;
  }

  return mostSpecificCondition;
}

//TODO: Get from tailwind config
const tailwindSizeOrder = ["sm", "md", "lg", "xl", "2xl"];

function sortTailwindSizes(sizeArray: TourCondition[]) {
  return sizeArray.sort((a, b) => {
    return (
      tailwindSizeOrder.indexOf(a.taildwindQuery) -
      tailwindSizeOrder.indexOf(b.taildwindQuery)
    );
  });
}

function isTailwindQueryLessOrEqual(
  superSet: TailwindQuery | "default",
  subSet: TailwindQuery | "default"
) {
  // if both are default then return true
  if (subSet === "default" && superSet === "default") return true;

  // if the subSet is default then return false
  if (subSet === "default") return false;

  // if the superSet is default then return true
  if (superSet === "default") return true;

  // if both are not default then compare the indexes
  return (
    tailwindSizeOrder.indexOf(superSet) <= tailwindSizeOrder.indexOf(subSet)
  );
}

export {
  isHidden,
  calculatePositionLeft,
  calculatePositionTop,
  checkMediaQuery,
  sortTailwindSizes,
  getMostSpecificCondition,
  getCurrentTailwindQuery,
};

export type { TailwindQuery, TourCondition, TourProps };
