import { toApiDate } from "./dates.js";

export const publicUserSelect = { id: true, full_name: true, email: true };

export const serializeUser = (user) => ({
  id: user.id,
  fullName: user.full_name,
  email: user.email,
});

export const projectSelect = {
  id: true,
  name: true,
  description: true,
  status: true,
  start_date: true,
  end_date: true,
  created_at: true,
  updated_at: true,
};

export const serializeProject = (project, counts = { taskCount: 0, completedTaskCount: 0 }) => ({
  id: project.id,
  name: project.name,
  description: project.description,
  status: project.status,
  startDate: toApiDate(project.start_date),
  endDate: toApiDate(project.end_date),
  taskCount: counts.taskCount,
  completedTaskCount: counts.completedTaskCount,
  createdAt: project.created_at.toISOString(),
  updatedAt: project.updated_at.toISOString(),
});

export const taskSelect = {
  id: true,
  project_id: true,
  name: true,
  description: true,
  priority: true,
  status: true,
  due_date: true,
  created_at: true,
  updated_at: true,
  projects: { select: { name: true } },
};

export const serializeTask = (task) => ({
  id: task.id,
  projectId: task.project_id,
  projectName: task.projects.name,
  name: task.name,
  description: task.description,
  priority: task.priority,
  status: task.status,
  dueDate: toApiDate(task.due_date),
  createdAt: task.created_at.toISOString(),
  updatedAt: task.updated_at.toISOString(),
});
