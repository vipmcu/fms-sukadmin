import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const dbUrl = process.env.DATABASE_URL 
  || process.env.DB_POSTGRES_URL 
  || process.env.DB_DATABASE_URL 
  || process.env.POSTGRES_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "npx tsx prisma/seed.ts" },
  engine: "classic",
  datasource: { url: dbUrl || env("DATABASE_URL") },
});
