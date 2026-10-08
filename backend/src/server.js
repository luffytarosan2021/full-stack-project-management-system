import app from "./app.js";
import { env } from "./config/env.js";
import { checkDatabaseConnection, prisma } from "./config/prisma.js";
import { logger } from "./utils/logger.js";

async function start() {
  try {
    await checkDatabaseConnection();
    logger.info("Database connection established");
  } catch (err) {
    logger.error(`Database connection failed: ${err.message}`);
    process.exit(1);
  }

  const server = app.listen(env.PORT, (err) => {
    if (err) {
      logger.error(`Server failed to start: ${err.message}`);
      process.exit(1);
    }
    logger.info(`Server listening on port ${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start();
