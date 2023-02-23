// imports GetServerSideProps from nextjs
import { NextPage } from "next";
import Link from "next/link";
import React, { useRef, useState } from "react";

// creates a NextFunctionComponent
const DragScrollContainer: NextPage<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  // i sacrificed my first son to the gods of copilot to make them happy (nearly all of the code below is copilot's doing)
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

    // set the cursor to grabbing
    container.current.style.cursor = "grabbing";
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

  // declare a mouseUp react handler for drag scrolling
  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!container.current) return;

    // set isDragging to false
    setIsDragging(false);

    // set startX to 0
    setStartX(0);

    // set scrollLeft to 0
    setScrollLeft(0);

    // set the cursor to default
    container.current.style.cursor = "default";
  };

  // returns a React component
  return (
    <div
      className={`flex flex-nowrap overflow-x-scroll gap-x-4 ${
        className || ""
      } scroll-pb-2 drag-scroll`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      ref={container}
    >
      {children}
    </div>
  );
};

// exports it
export default DragScrollContainer;
