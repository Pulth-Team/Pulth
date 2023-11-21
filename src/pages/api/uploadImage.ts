import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "~/server/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "~/env.mjs";
import formidable from "formidable";
import fs from "fs";

const s3config = {
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_CDN,
    secretAccessKey: env.AWS_SECRET_KEY_CDN,
  },
};

const UploadImage = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, nextAuthOptions);

  if (!session) {
    return res.send({
      error: "You must be signed in to upload an image to the server.",
    });
  }
  const form = formidable({
    maxFileSize: 10 * 1024 * 1024, // 10 MB
    keepExtensions: true,
    multiples: false,
  });

  const parseResult: Error | formidable.File = await new Promise<
    Error | formidable.File
  >((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }

      if (!files.imageFile) {
        return reject(new Error("No file was provided."));
      }

      let file: formidable.File = Array.isArray(files.imageFile)
        ? (files.imageFile[0] as formidable.File)
        : files.imageFile;

      return resolve(file);
    });
  }).catch((err) => {
    return err;
  });

  if (parseResult instanceof Error) {
    return res.send({
      error: "There was an error uploading the file.",
      errorValue: parseResult,
    });
  }

  const s3Client = new S3Client(s3config);

  const putObjectResponse = await s3Client
    .send(
      new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: session.user?.id + "/" + parseResult.newFilename,
        ACL: "public-read",
        Body: fs.createReadStream(parseResult.filepath),
      })
    )
    .catch((err) => {
      console.log(err);
      return res.send({
        error: "There was an error uploading the file.",
        errorValue: err,
      });
    });

  return res.send({
    url: `https://cdn.pulth.com/${
      session.user?.id + "/" + parseResult.newFilename
    }`,
  });
};

export default UploadImage;
export const config = {
  api: {
    bodyParser: false,
  },
};
