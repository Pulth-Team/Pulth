import type { NextPage } from "next";

import { RenderElementProps } from "slate-react";
import { ElementTypes } from "../../types/renderer";

const HeadingElement: NextPage<{
  props: RenderElementProps;
  className: string;
}> = ({ props, className }) => {
  if (props.element.type !== ElementTypes.Heading)
    return (
      <div>
        Wrong type expecting {ElementTypes.Heading} but got {props.element.type}
      </div>
    );

  switch (props.element.data.level) {
    case 1:
      return (
        <h1 {...props.attributes} className={`text-4xl my-2 ${className}`}>
          {props.children}
        </h1>
      );
    case 2:
      return (
        <h2 {...props.attributes} className={`text-3xl my-2 ${className}`}>
          {props.children}
        </h2>
      );
    case 3:
      return (
        <h3 {...props.attributes} className={`text-2xl my-2 ${className}`}>
          {props.children}
        </h3>
      );
    case 4:
      return (
        <h4
          {...props.attributes}
          className={`text-xl font-semibold ${className}`}
        >
          {props.children}
        </h4>
      );
    case 5:
      return (
        <h5
          {...props.attributes}
          className={`text-lg font-semibold ${className}`}
        >
          {props.children}
        </h5>
      );
    case 6:
      return (
        <h6
          {...props.attributes}
          className={`text-base font-semibold ${className}`}
        >
          {props.children}
        </h6>
      );
    default:
      return (
        <div>Wrong level expecting 1-6 but got {props.element.data.level}</div>
      );
  }
};

export default HeadingElement;
