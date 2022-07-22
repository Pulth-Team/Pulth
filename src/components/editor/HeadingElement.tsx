import type { NextPage } from "next";

import { RenderElementProps } from "slate-react";

const HeadingElement: NextPage<{
  props: RenderElementProps;
  className: string;
}> = ({ props, className }) => {
  return (
    <>
      <h1 {...props.attributes} className={`text-3xl ${className}`}>
        {props.children}
      </h1>
    </>
  );
};

export default HeadingElement;
