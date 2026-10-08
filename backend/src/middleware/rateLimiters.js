import rateLimit, { MemoryStore } from "express-rate-limit";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

const stores = [];

function createLimiter(options) {
  const store = new MemoryStore();
  stores.push(store);

  return rateLimit({
    ...options,
    store,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler(req, res, next) {
      logger.warn(`Rate limit exceeded: ${req.method} ${req.originalUrl} from ${req.ip}`);
      next(new AppError(429, "RATE_LIMITED", "Too many requests. Please try again later."));
    },
  });
}

export const apiLimiter = createLimiter({ windowMs: 15 * 60 * 1000, limit: 300 });

export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
});

export const registerLimiter = createLimiter({ windowMs: 60 * 60 * 1000, limit: 5 });

// Lets integration tests start each case with fresh in-memory counters.
export async function resetRateLimits() {
  await Promise.all(stores.map((store) => store.resetAll()));
}
