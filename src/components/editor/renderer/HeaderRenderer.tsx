import { NextPage } from "next";

const HeaderRenderer: NextPage<{ level: number; text: string }> = ({
  level,
  text,
}) => {
  switch (level) {
    case 1:
      return <h1 className="m-0 p-0 mb-2 font-bold text-3xl">{text}</h1>;
    case 2:
      return <h2 className="m-0 p-0 mb-2 font-bold text-2xl">{text}</h2>;
    case 3:
      return <h3 className="m-0 p-0 mb-2 font-bold text-xl">{text}</h3>;
    case 4:
      return <h4 className="m-0 p-0 mb-2 font-bold text-base">{text}</h4>;
    case 5:
      return <h5 className="m-0 p-0 mb-2 font-bold text-sm">{text}</h5>;
    case 6:
      return <h1 className="m-0 p-0 mb-2 font-bold text-xs">{text}</h1>;
    default:
      return <p>invalid level for header</p>;
  }
};

export default HeaderRenderer;
