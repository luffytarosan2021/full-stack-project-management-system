import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { toDbDate } from "../utils/dates.js";
import { escapeLike } from "../utils/search.js";
import { serializeTask, taskSelect } from "../utils/serializers.js";

const taskNotFound = () => new AppError(404, "NOT_FOUND", "Task not found.");
const projectNotFound = () => new AppError(404, "NOT_FOUND", "Project not found.");

// Tasks have no user_id: ownership is always task -> project -> user, checked inside the query.
const ownedBy = (userId) => ({ projects: { user_id: userId } });

async function assertProjectOwned(userId, projectId) {
  const project = await prisma.projects.findFirst({
    where: { id: projectId, user_id: userId },
    select: { id: true },
  });
  if (!project) throw projectNotFound();
}

export async function listTasks(userId, { projectId, search, status, priority }) {
  if (projectId) await assertProjectOwned(userId, projectId);

  const tasks = await prisma.tasks.findMany({
    where: {
      ...ownedBy(userId),
      ...(projectId && { project_id: projectId }),
      ...(search && { name: { contains: escapeLike(search) } }),
      ...(status && { status }),
      ...(priority && { priority }),
    },
    orderBy: [{ due_date: "asc" }, { created_at: "asc" }, { id: "asc" }],
    select: taskSelect,
  });

  const items = tasks.map(serializeTask);
  return { items, total: items.length };
}

export async function getTask(userId, id) {
  const task = await prisma.tasks.findFirst({ where: { id, ...ownedBy(userId) }, select: taskSelect });
  if (!task) throw taskNotFound();
  return serializeTask(task);
}

export async function createTask(userId, { projectId, name, description, priority, status, dueDate }) {
  await assertProjectOwned(userId, projectId);

  const task = await prisma.tasks.create({
    data: {
      id: randomUUID(),
      project_id: projectId,
      name,
      description: description ?? null,
      priority,
      status,
      due_date: toDbDate(dueDate),
    },
    select: taskSelect,
  });
  return serializeTask(task);
}

export async function updateTask(userId, id, { name, description, priority, status, dueDate }) {
  try {
    const task = await prisma.tasks.update({
      where: { id, ...ownedBy(userId) },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status }),
        ...(dueDate !== undefined && { due_date: toDbDate(dueDate) }),
        updated_at: new Date(),
      },
      select: taskSelect,
    });
    return serializeTask(task);
  } catch (err) {
    if (err?.code === "P2025") throw taskNotFound();
    throw err;
  }
}

export async function deleteTask(userId, id) {
  const { count } = await prisma.tasks.deleteMany({ where: { id, ...ownedBy(userId) } });
  if (count === 0) throw taskNotFound();
}
