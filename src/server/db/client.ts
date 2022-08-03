// src/server/db/client.ts
import { PrismaClient } from "@prisma/client";
import { env } from "../env.mjs";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    // log: ["query"],
    log: ["info", "warn", "error"],
  });

if (env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
