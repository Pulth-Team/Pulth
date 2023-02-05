import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "./auth/[...nextauth]";

import { S3 } from "aws-sdk";
import { env } from "../../env/server.mjs";
import formidable from "formidable";
import fs from "fs";

const s3 = new S3({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_CDN,
    secretAccessKey: env.AWS_SECRET_KEY_CDN,
  },
});

const UploadImage = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, nextAuthOptions);

  if (!session) {
    return res.send({
      error: "You must be signed in to upload an image to the server.",
    });
  }
  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    if (!files.imageFile) {
      return res.send({
        error: "No file was provided.",
      });
    }

    let file: formidable.File = Array.isArray(files.imageFile)
      ? (files.imageFile[0] as formidable.File)
      : files.imageFile;

    return s3.putObject(
      {
        Bucket: env.AWS_S3_BUCKET,
        Key: session.user?.id + "/" + file.originalFilename,
        Body: fs.createReadStream(file.filepath),
        ACL: "public-read",
      },
      (err, data) => {
        if (err) {
          console.log(err);
          return res.send({ error: "There was an error uploading the file." });
        }
        return res.send({
          url: `https://cdn.pulth.com/${
            session.user?.id + "/" + file.originalFilename
          }`,
        });
      }
    );
  });

  // res.send({ hi: "hi" });
};

export default UploadImage;
export const config = {
  api: {
    bodyParser: false,
  },
};
