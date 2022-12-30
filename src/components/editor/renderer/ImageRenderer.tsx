import type { NextPage } from "next";
import Image from "next/image";
import InlineRenderer from "./InlineRenderer";

const ImageRenderer: NextPage<{ url: string; caption: string }> = ({
  url,
  caption,
}) => {
  return (
    <div className="my-4">
      <div className="my-3 relative overflow-hidden align-bottom max-w-full aspect-video ">
        <Image
          layout="fill"
          objectFit="cover"
          src={url}
          alt={caption}
          className="aspect-square"
        />
      </div>
      <div className="text-center text-sm italic">
        <InlineRenderer text={caption} />
      </div>
    </div>
  );
};

export default ImageRenderer;
