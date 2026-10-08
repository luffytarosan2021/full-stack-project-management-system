import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client.ts";
import { env } from "./env.js";

const connectionUrl = new URL(env.DATABASE_URL);
connectionUrl.searchParams.set("timezone", "Z");

if (env.NODE_ENV === "production") {
  connectionUrl.searchParams.set("sslcert", "/etc/secrets/ca.pem");
  connectionUrl.searchParams.set("sslaccept", "strict");
}

const adapter = new PrismaMariaDb(connectionUrl.toString());

export const prisma = new PrismaClient({ adapter });

export async function checkDatabaseConnection() {
  await prisma.$queryRaw`SELECT 1`;
}