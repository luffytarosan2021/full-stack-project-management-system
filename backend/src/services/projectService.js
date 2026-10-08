import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { toApiDate, toDbDate } from "../utils/dates.js";
import { escapeLike } from "../utils/search.js";
import { projectSelect, serializeProject } from "../utils/serializers.js";
import { END_BEFORE_START_MESSAGE } from "../validators/projectValidators.js";

const notFound = () => new AppError(404, "NOT_FOUND", "Project not found.");

// One grouped query for any number of projects (no N+1).
async function countTasks(projectIds) {
  const counts = new Map(projectIds.map((id) => [id, { taskCount: 0, completedTaskCount: 0 }]));
  if (projectIds.length === 0) return counts;

  const groups = await prisma.tasks.groupBy({
    by: ["project_id", "status"],
    where: { project_id: { in: projectIds } },
    _count: { _all: true },
  });
  for (const group of groups) {
    const entry = counts.get(group.project_id);
    entry.taskCount += group._count._all;
    if (group.status === "COMPLETED") entry.completedTaskCount += group._count._all;
  }
  return counts;
}

async function withCounts(project) {
  const counts = await countTasks([project.id]);
  return serializeProject(project, counts.get(project.id));
}

async function findOwnedProject(userId, id) {
  const project = await prisma.projects.findFirst({ where: { id, user_id: userId }, select: projectSelect });
  if (!project) throw notFound();
  return project;
}

export async function listProjects(userId, { search, status }) {
  const projects = await prisma.projects.findMany({
    where: {
      user_id: userId,
      ...(search && { name: { contains: escapeLike(search) } }),
      ...(status && { status }),
    },
    orderBy: [{ created_at: "desc" }, { id: "asc" }],
    select: projectSelect,
  });

  const counts = await countTasks(projects.map((project) => project.id));
  const items = projects.map((project) => serializeProject(project, counts.get(project.id)));
  return { items, total: items.length };
}

export async function getProject(userId, id) {
  return withCounts(await findOwnedProject(userId, id));
}

export async function createProject(userId, { name, description, status, startDate, endDate }) {
  const project = await prisma.projects.create({
    data: {
      id: randomUUID(),
      user_id: userId,
      name,
      description: description ?? null,
      status,
      start_date: toDbDate(startDate),
      end_date: toDbDate(endDate),
    },
    select: projectSelect,
  });
  return serializeProject(project);
}

function assertDateOrder(existing, { startDate, endDate }) {
  const start = startDate ?? toApiDate(existing.start_date);
  const end = endDate ?? toApiDate(existing.end_date);
  if (end >= start) return;

  const field = endDate !== undefined ? "endDate" : "startDate";
  const message = field === "endDate" ? END_BEFORE_START_MESSAGE : "Start date must be on or before end date";
  throw new AppError(400, "VALIDATION_ERROR", "Invalid request", { fields: [{ field, message }] });
}

export async function updateProject(userId, id, changes) {
  const existing = await findOwnedProject(userId, id);
  assertDateOrder(existing, changes);

  const { name, description, status, startDate, endDate } = changes;
  const project = await prisma.projects.update({
    where: { id, user_id: userId },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(startDate !== undefined && { start_date: toDbDate(startDate) }),
      ...(endDate !== undefined && { end_date: toDbDate(endDate) }),
      updated_at: new Date(),
    },
    select: projectSelect,
  });
  return withCounts(project);
}

export async function deleteProject(userId, id) {
  // Tasks are removed by the database's ON DELETE CASCADE on fk_tasks_project.
  const { count } = await prisma.projects.deleteMany({ where: { id, user_id: userId } });
  if (count === 0) throw notFound();
}
