import { NextPage } from "next";
import Link from "next/link";
import React, { useRef, useState, useLayoutEffect, useCallback } from "react";

function isHidden(el: HTMLElement) {
  var style = window.getComputedStyle(el);
  return el.offsetParent === null || style.display === "none";
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

export { isHidden, calculatePositionLeft, calculatePositionTop };
