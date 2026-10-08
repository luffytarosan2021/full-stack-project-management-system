import { Router } from "express";
import { login, logout, me, register } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { loginLimiter, registerLimiter } from "../middleware/rateLimiters.js";
import { validateBody } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../validators/authValidators.js";

const router = Router();

router.post("/register", registerLimiter, validateBody(registerSchema), register);
router.post("/login", loginLimiter, validateBody(loginSchema), login);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, me);

export default router;
