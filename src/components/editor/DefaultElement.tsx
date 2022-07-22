import type { NextPage } from "next";

import { RenderElementProps } from "slate-react";

const DefaultElement: NextPage<{
  props: RenderElementProps;
  className: string;
}> = ({ props, className }) => {
  return (
    <>
      <p {...props.attributes} className={`${className}`}>
        {props.children}
      </p>
    </>
  );
};

export default DefaultElement;
