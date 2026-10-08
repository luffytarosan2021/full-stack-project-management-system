import { loginUser, registerUser } from "../services/authService.js";
import { logger } from "../utils/logger.js";

export async function register(req, res) {
  const result = await registerUser(req.validatedBody);
  res.status(201).json({ data: result });
}

export async function login(req, res) {
  try {
    const result = await loginUser(req.validatedBody);
    res.status(200).json({ data: result });
  } catch (err) {
    if (err.code === "INVALID_CREDENTIALS") logger.warn(`Failed login from ${req.ip}`);
    throw err;
  }
}

export function logout(req, res) {
  res.status(200).json({ data: { message: "Logged out successfully" } });
}

export function me(req, res) {
  res.status(200).json({ data: req.user });
}
