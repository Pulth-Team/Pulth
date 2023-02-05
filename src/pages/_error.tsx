import type { NextPage } from "next";
import type { ErrorProps } from "next/error";
import NextErrorComponent from "next/error";

const CustomErrorComponent: NextPage<ErrorProps> = (props) => {
  return <NextErrorComponent statusCode={props.statusCode} />;
};

export default CustomErrorComponent;
