import { PrismaClient, type Prisma } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function getDatabaseUrl(): string {
  const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV !== undefined;
  const url = isVercel
    ? (process.env.DB_POSTGRES_URL || process.env.DB_DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL)
    : (process.env.DATABASE_URL || process.env.DB_POSTGRES_URL || process.env.DB_DATABASE_URL || process.env.POSTGRES_URL);

  if (!url) {
    throw new Error("Database connection URL is missing. Expected DATABASE_URL or DB_POSTGRES_URL.");
  }
  return url;
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: getDatabaseUrl() });
  return new PrismaClient({ adapter, log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"] });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** ใช้เป็นชนิดของพารามิเตอร์ db ใน service เพื่อรับทั้ง client และ transaction */
export type Db = PrismaClient | Prisma.TransactionClient;
