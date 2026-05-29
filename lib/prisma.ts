import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const url = new URL(process.env.DATABASE_URL!);
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    connectionLimit: 2,
    acquireTimeout: 10000,
  });
  return new PrismaClient({ adapter });
}

// Lazy proxy so module evaluation during build-time config collection
// doesn't call createPrismaClient() before DATABASE_URL is available.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = (globalForPrisma.prisma ??= createPrismaClient());
    return Reflect.get(client as unknown as object, prop, receiver);
  },
});
