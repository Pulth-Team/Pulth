import { NextPage } from "next";

const HeaderRenderer: NextPage<{ level: number; text: string }> = ({
  level,
  text,
}) => {
  switch (level) {
    case 1:
      return <h1 className="m-0 mb-2 p-0 text-3xl font-bold">{text}</h1>;
    case 2:
      return <h2 className="m-0 mb-2 p-0 text-2xl font-semibold">{text}</h2>;
    case 3:
      return <h3 className="m-0 mb-2 p-0 text-xl font-medium">{text}</h3>;
    case 4:
      return <h4 className="m-0 mb-2 p-0 text-base font-medium">{text}</h4>;
    case 5:
      return <h5 className="m-0 mb-2 p-0 text-sm font-medium">{text}</h5>;
    case 6:
      return <h1 className="m-0 mb-2 p-0 text-xs font-medium">{text}</h1>;
    default:
      return <p>invalid level for header</p>;
  }
};

export default HeaderRenderer;
