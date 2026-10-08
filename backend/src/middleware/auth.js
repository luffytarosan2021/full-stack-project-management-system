import jwt from "jsonwebtoken";
import { findPublicUserById } from "../services/authService.js";
import { AppError } from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";
import { logger } from "../utils/logger.js";

const BEARER_PATTERN = /^Bearer ([^\s]+)$/i;

const unauthorized = () => new AppError(401, "UNAUTHORIZED", "Authentication required.");
const tokenExpired = () =>
  new AppError(401, "TOKEN_EXPIRED", "Your session has expired. Please log in again.");

function reject(req, next, error) {
  logger.warn(`401 ${error.code}: ${req.method} ${req.originalUrl} from ${req.ip}`);
  next(error);
}

export async function authenticate(req, res, next) {
  const match = BEARER_PATTERN.exec(req.get("authorization") ?? "");
  if (!match) return reject(req, next, unauthorized());

  let userId;
  try {
    userId = verifyToken(match[1]);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) return reject(req, next, tokenExpired());
    if (err instanceof jwt.JsonWebTokenError) return reject(req, next, unauthorized());
    return next(err);
  }

  const user = await findPublicUserById(userId);
  if (!user) return reject(req, next, unauthorized());

  req.user = user;
  return next();
}
