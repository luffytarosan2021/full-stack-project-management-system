import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const ALGORITHM = "HS256";

export function signToken(userId) {
  return jwt.sign({}, env.JWT_SECRET, {
    algorithm: ALGORITHM,
    subject: userId,
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

// Throws jsonwebtoken's TokenExpiredError / JsonWebTokenError on failure.
export function verifyToken(token) {
  const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: [ALGORITHM] });
  if (typeof payload.sub !== "string" || payload.sub.length === 0) {
    throw new jwt.JsonWebTokenError("Token has no subject");
  }
  return payload.sub;
}
