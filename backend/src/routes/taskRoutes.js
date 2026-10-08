import { Router } from "express";
import { create, getById, list, remove, update } from "../controllers/taskController.js";
import { authenticate } from "../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import { createTaskSchema, listTasksQuery, taskIdParams, updateTaskSchema } from "../validators/taskValidators.js";

const router = Router();

router.use(authenticate);

router.get("/", validateQuery(listTasksQuery), list);
router.post("/", validateBody(createTaskSchema), create);
router.get("/:id", validateParams(taskIdParams), getById);
router.put("/:id", validateParams(taskIdParams), validateBody(updateTaskSchema), update);
router.delete("/:id", validateParams(taskIdParams), remove);

export default router;
