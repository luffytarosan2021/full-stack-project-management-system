import { Router } from "express";
import { create, getById, list, remove, update } from "../controllers/projectController.js";
import { authenticate } from "../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import {
  createProjectSchema,
  listProjectsQuery,
  projectIdParams,
  updateProjectSchema,
} from "../validators/projectValidators.js";

const router = Router();

router.use(authenticate);

router.get("/", validateQuery(listProjectsQuery), list);
router.post("/", validateBody(createProjectSchema), create);
router.get("/:id", validateParams(projectIdParams), getById);
router.put("/:id", validateParams(projectIdParams), validateBody(updateProjectSchema), update);
router.delete("/:id", validateParams(projectIdParams), remove);

export default router;
