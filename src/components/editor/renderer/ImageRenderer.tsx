import type { NextPage } from "next";
import Image from "next/image";
import InlineRenderer from "./InlineRenderer";
import { useState } from "react";

const ImageRenderer: NextPage<{ url: string; caption: string }> = ({
  url,
  caption,
}) => {
  // const [naturalHeight, setNaturalHeight] = useState(16 / 9);
  // const [naturalWidth, setNaturalWidth] = useState(16 / 9);
  const [ratio, setRatio] = useState(16 / 9);

  return (
    <div className="my-4">
      <div
        className={`relative my-3
           overflow-hidden
          align-bottom`}
        // style={{ aspectRatio: `${naturalWidth}/${naturalHeight}` }}
        style={{ aspectRatio: `${ratio}` }}
      >
        <Image
          layout="fill"
          objectFit="cover"
          src={url}
          alt={caption}
          loading="lazy"
          priority={false}
          onLoadingComplete={({ naturalWidth, naturalHeight }) => {
            setRatio(naturalWidth / naturalHeight);
            // setNaturalHeight(naturalHeight);
            // setNaturalWidth(naturalWidth);
          }}
        />
      </div>
      <div className="text-center text-sm italic">
        <p>{caption}</p>
      </div>
    </div>
  );
};

export default ImageRenderer;
