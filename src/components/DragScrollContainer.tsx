// imports GetServerSideProps from nextjs
import { NextPage } from "next";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { BatchElement } from "../types/renderer";
import BatchRenderer from "./BatchRenderer";

// creates a NextFunctionComponent
const DragScrollContainer: NextPage<{ children: React.ReactNode }> = () => {
  const container = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // declare a mouseDown react handler for drag scrolling
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!container.current) return;
    // set isDragging to true
    setIsDragging(true);

    // set startX to the x position of the mouse
    setStartX(e.pageX - container.current.offsetLeft);

    // set scrollLeft to the scrollLeft of the container
    setScrollLeft(container.current.scrollLeft);
  };

  // declare a mouseDown react handler for drag scrolling
  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!container.current) return;

    // if isDragging is false, return
    if (!isDragging) return;

    // set the scrollLeft of the container to the scrollLeft - the difference between the startX and the x position of the mouse
    container.current.scrollLeft =
      scrollLeft + startX - (e.pageX - container.current.offsetLeft);
  };

  // returns a React component
  return (
    <div
      className="flex flex-nowrap overflow-x-scroll gap-x-4 h-72 snap-x snap-mandatory snap-center"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsDragging(false)}
      ref={container}
    >
      <div className="h-64 w-40 bg-gray-300 flex-shrink-0">1</div>
      <div className="h-64 w-40 bg-gray-300 flex-shrink-0">2</div>
      <div className="h-64 w-40 bg-gray-300 flex-shrink-0">3</div>
      <div className="h-64 w-40 bg-gray-300 flex-shrink-0">4</div>
      <div className="h-64 w-40 bg-gray-300 flex-shrink-0">5</div>
      <div className="h-64 w-40 bg-gray-300 flex-shrink-0">6</div>
      <div className="h-64 w-40 bg-gray-300 flex-shrink-0">7</div>
      <div className="h-64 w-40 bg-gray-300 flex-shrink-0">8</div>
      <div className="h-64 w-40 bg-gray-300 flex-shrink-0">9</div>
      <div className="h-64 w-40 bg-gray-300 flex-shrink-0">10</div>
      <div className="h-64 w-40 bg-gray-300 flex-shrink-0">11</div>
      <div className="h-64 w-40 bg-gray-300 flex-shrink-0">12</div>
    </div>
  );
};

// exports it
export default DragScrollContainer;
