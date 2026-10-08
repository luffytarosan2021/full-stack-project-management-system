import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client.ts";
import { env } from "./env.js";

// The adapter writes and reads TIMESTAMP values as UTC strings, so every session must use UTC.
// The driver's `timezone=Z` option runs `SET time_zone = '+00:00'` on each new connection, which
// keeps MySQL's CURRENT_TIMESTAMP / ON UPDATE values consistent with Prisma's, whatever the
// server's own time zone is.
const connectionUrl = new URL(env.DATABASE_URL);
connectionUrl.searchParams.set("timezone", "Z");

const adapter = new PrismaMariaDb(connectionUrl.toString());

export const prisma = new PrismaClient({ adapter });

export async function checkDatabaseConnection() {
  await prisma.$queryRaw`SELECT 1`;
}
