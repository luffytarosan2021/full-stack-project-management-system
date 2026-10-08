import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
} from "../services/projectService.js";

export async function list(req, res) {
  res.status(200).json({ data: await listProjects(req.user.id, req.validatedQuery) });
}

export async function getById(req, res) {
  res.status(200).json({ data: await getProject(req.user.id, req.validatedParams.id) });
}

export async function create(req, res) {
  res.status(201).json({ data: await createProject(req.user.id, req.validatedBody) });
}

export async function update(req, res) {
  const project = await updateProject(req.user.id, req.validatedParams.id, req.validatedBody);
  res.status(200).json({ data: project });
}

export async function remove(req, res) {
  await deleteProject(req.user.id, req.validatedParams.id);
  res.status(200).json({ data: { message: "Project deleted successfully" } });
}
