// Example of a restricted endpoint that only authenticated users can access from https://next-auth.js.org/getting-started/example

import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "./auth/[...nextauth]";

import { S3 } from "aws-sdk";
import { env } from "../../server/env.mjs";

const UploadImage = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, nextAuthOptions);

  if (session) {
    // get user id from session
    const userId = session.user?.id;

    // check if user is signed in
    if (!userId)
      return res.send({
        error: "You must be signed in to upload an image to the server.",
      });

    // get image from request
    const image = req.body.Image;

    // check if image is valid
    if (!image) {
      return res.send({
        error: "You must provide an image to upload to the server.",
      });
    }
    // create s3 client
    const s3 = new S3({
      accessKeyId: env.AWS_ACCESS_KEY_CDN,
      secretAccessKey: env.AWS_SECRET_KEY_CDN,
      region: env.AWS_REGION,
    });

    // upload image to s3 bucket
    s3.putObject(
      {
        Bucket: env.AWS_S3_BUCKET,
        Key: `images/${userId}/${image.name}`,
        Body: image.data,
        ACL: "public-read",
      },
      async (error, data) => {
        if (error) {
          console.log(error);
          return res.send({
            error:
              "An error occurred while uploading your image to the server.",
          });
        }
        console.log(data);

        await prisma?.image
          .create({
            data: {
              url: `https://cdn.pulth.com/${userId}/${image.name}`,
              userId: userId,
              alt: image.name,
            },
          })
          .catch((error) => {
            console.log(error);
          })
          .finally(async () => {
            return res.send({
              data: `https://cdn.pulth.com/${userId}/${image.name}`,
            });
          });
      }
    );
    // save image to database

    // return image url
  } else {
    res.send({
      error: "You must be signed in to upload an image to the server.",
    });
  }
};

export default UploadImage;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb", // Set desired size of the body
    },
  },
};
