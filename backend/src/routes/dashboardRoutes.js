import { Router } from "express";
import { show } from "../controllers/dashboardController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, show);

export default router;
