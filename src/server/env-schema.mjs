import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),

  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().url(),

  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),

  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),

  ALGOLIA_APP_ID: z.string(),
  ALGOLIA_API_KEY: z.string(),

  AWS_ACCESS_KEY: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string().default("us-east-1"),

  AWS_S3_BUCKET: z.string(),
});
