import fs from "node:fs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client.ts";
import { env } from "./env.js";

const connectionUrl = new URL(env.DATABASE_URL);

const isProduction = env.NODE_ENV === "production";

const adapterOptions = {
  host: connectionUrl.hostname,
  port: Number(connectionUrl.port || 3306),
  user: decodeURIComponent(connectionUrl.username),
  password: decodeURIComponent(connectionUrl.password),
  database: connectionUrl.pathname.slice(1),
  connectionLimit: 10,
  connectTimeout: 10000,
  timezone: "Z",
};

if (isProduction) {
  adapterOptions.ssl = {
    ca: fs.readFileSync("/etc/secrets/ca.pem"),
  };
}

const adapter = new PrismaMariaDb(adapterOptions);

export const prisma = new PrismaClient({ adapter });

export async function checkDatabaseConnection() {
  await prisma.$queryRaw`SELECT 1`;
}