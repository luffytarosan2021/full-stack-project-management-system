import { checkDatabaseConnection, prisma } from "./src/config/prisma.js";
import { logger } from "./src/utils/logger.js";

try {
  await checkDatabaseConnection();
  logger.info("DATABASE CONNECTED");
} catch (err) {
  logger.error(`DATABASE CONNECTION FAILED: ${err.message}`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
