import { NextRequest, NextResponse } from "next/server";
import { env } from "~/env.mjs";

import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();

export default async function incr(req: NextRequest): Promise<NextResponse> {
  // if the method is not post return an error
  if (req.method !== "POST") {
    return new NextResponse("Method not allowed", { status: 405 });
  }
  if (req.headers.get("Content-Type") !== "application/json") {
    return new NextResponse("must be json", { status: 400 });
  }

  // get the slug from the request body
  const body = await req.json();
  // assign the slug to a variable
  const slug = body.slug as string | undefined;

  // check if the slug exists
  if (!slug) {
    // if the slug does not exist, return an error
    return new NextResponse("Slug not found", { status: 400 });
  }

  // get the IP address of the user
  const ip = req.ip;

  // Hash the IP and turn it into a hex string
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(ip)
  );

  // convert the buffer to a hex string
  const hash = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // is this ip & slug combination new in the redis cache?
  const isThereARecord = await redis.set(
    [env.REDIS_GROUP, "deduplicate", hash, slug].join(":"),
    true,
    {
      nx: true,
      // at most 1 views for 1 hour
      ex: 60 * 60,
      get: true,
    }
  );

  console.log(isThereARecord);

  // if the ip & slug combination is not new in the redis cache, return a 202
  if (isThereARecord) {
    return new NextResponse(null, { status: 202 });
  }

  // if the ip & slug combination is new in the redis cache, increment the slug
  await redis.incr([env.REDIS_GROUP, "pageviews", slug].join(":"));

  return new NextResponse(null, { status: 202 });
}

export const config = {
  runtime: "edge",
};
