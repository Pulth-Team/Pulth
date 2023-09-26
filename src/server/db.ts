import { PrismaClient } from "@prisma/client";
import extension from "./databaseExtension";

import { env } from "~/env.mjs";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof CreatePrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? CreatePrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

function CreatePrismaClient() {
  const extendedPrisma = new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  }).$extends(extension);
  return extendedPrisma;
}
