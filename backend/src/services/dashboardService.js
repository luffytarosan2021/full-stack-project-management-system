import { prisma } from "../config/prisma.js";

const countByStatus = (groups) =>
  Object.fromEntries(groups.map((group) => [group.status, group._count._all]));

const sum = (counts) => Object.values(counts).reduce((total, count) => total + count, 0);

// Two grouped COUNT queries; tasks are owned through task -> project -> user.
export async function getDashboardStats(userId) {
  const [projectGroups, taskGroups] = await Promise.all([
    prisma.projects.groupBy({ by: ["status"], where: { user_id: userId }, _count: { _all: true } }),
    prisma.tasks.groupBy({ by: ["status"], where: { projects: { user_id: userId } }, _count: { _all: true } }),
  ]);

  const projects = countByStatus(projectGroups);
  const tasks = countByStatus(taskGroups);

  return {
    totalProjects: sum(projects),
    totalTasks: sum(tasks),
    completedTasks: tasks.COMPLETED ?? 0,
    pendingTasks: tasks.PENDING ?? 0,
    projectsInProgress: projects.IN_PROGRESS ?? 0,
  };
}
