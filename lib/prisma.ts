// Shared Prisma client singleton. Avoids exhausting DB connections from
// hot-reloaded module instances in development.
// Prisma 7 dropped the schema-file `datasource.url` — the client now takes
// its connection via an explicit driver adapter.
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg(process.env.DATABASE_URL!);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
