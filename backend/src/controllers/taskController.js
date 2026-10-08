import { createTask, deleteTask, getTask, listTasks, updateTask } from "../services/taskService.js";

export async function list(req, res) {
  res.status(200).json({ data: await listTasks(req.user.id, req.validatedQuery) });
}

export async function getById(req, res) {
  res.status(200).json({ data: await getTask(req.user.id, req.validatedParams.id) });
}

export async function create(req, res) {
  res.status(201).json({ data: await createTask(req.user.id, req.validatedBody) });
}

export async function update(req, res) {
  const task = await updateTask(req.user.id, req.validatedParams.id, req.validatedBody);
  res.status(200).json({ data: task });
}

export async function remove(req, res) {
  await deleteTask(req.user.id, req.validatedParams.id);
  res.status(200).json({ data: { message: "Task deleted successfully" } });
}
