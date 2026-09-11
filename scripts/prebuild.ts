import { execSync } from "child_process";

const dbUrl = process.env.DATABASE_URL 
  || process.env.DB_POSTGRES_URL 
  || process.env.DB_DATABASE_URL 
  || process.env.POSTGRES_URL;

if (dbUrl) {
  process.env.DATABASE_URL = dbUrl;
  console.log("🚀 [prebuild] Database URL detected. Running Prisma migrate deploy...");
  try {
    execSync("npx prisma migrate deploy", { stdio: "inherit", env: process.env });
    console.log("🌱 [prebuild] Running seed-production-modules for MCU Buddhasothorn...");
    execSync("npx tsx scripts/seed-production-modules.ts", { stdio: "inherit", env: process.env });
    console.log("✅ [prebuild] Database setup and seeding completed successfully!");
  } catch (err) {
    console.error("⚠️ [prebuild] Warning during DB migration/seed:", err);
  }
} else {
  console.log("ℹ️ [prebuild] No DB URL found in environment, skipping migration.");
}
