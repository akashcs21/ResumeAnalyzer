import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "./src/lib/db/schema.js",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  },
});
