import { randomUUID } from "node:crypto";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { resetRateLimits } from "../src/middleware/rateLimiters.js";

const RUN_ID = randomUUID().slice(0, 8);
const EMAIL_PREFIX = `dashboard-${RUN_ID}-`;
const ZERO = { totalProjects: 0, totalTasks: 0, completedTasks: 0, pendingTasks: 0, projectsInProgress: 0 };

let alice;
let bob;
let aliceProjects;

async function registerUser(label) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ fullName: label, email: `${EMAIL_PREFIX}${label}@example.test`, password: "password123" });
  expect(res.status).toBe(201);
  return { ...res.body.data.user, token: res.body.data.token };
}

const authed = (user, req) => req.set("Authorization", `Bearer ${user.token}`);
const dashboard = (user, query = "") => authed(user, request(app).get(`/api/dashboard${query}`));

async function createProject(user, status) {
  const res = await authed(user, request(app).post("/api/projects")).send({
    name: `${status} project`,
    status,
    startDate: "2026-10-01",
    endDate: "2026-12-31",
  });
  expect(res.status).toBe(201);
  return res.body.data;
}

async function createTasks(user, projectId, statuses) {
  const tasks = [];
  for (const status of statuses) {
    const res = await authed(user, request(app).post("/api/tasks")).send({
      projectId,
      name: `${status} task`,
      priority: "MEDIUM",
      status,
      dueDate: "2026-10-15",
    });
    expect(res.status).toBe(201);
    tasks.push(res.body.data);
  }
  return tasks;
}

beforeAll(async () => {
  alice = await registerUser("alice");
  bob = await registerUser("bob");

  // Alice: 4 projects (2 IN_PROGRESS) and 7 tasks (2 PENDING, 2 IN_PROGRESS, 3 COMPLETED).
  aliceProjects = {
    inProgressA: await createProject(alice, "IN_PROGRESS"),
    inProgressB: await createProject(alice, "IN_PROGRESS"),
    notStarted: await createProject(alice, "NOT_STARTED"),
    completed: await createProject(alice, "COMPLETED"),
  };
  await createTasks(alice, aliceProjects.inProgressA.id, ["PENDING", "PENDING", "IN_PROGRESS", "COMPLETED"]);
  await createTasks(alice, aliceProjects.inProgressB.id, ["COMPLETED", "COMPLETED"]);
  await createTasks(alice, aliceProjects.notStarted.id, ["IN_PROGRESS"]);

  // Bob: data that must never appear in Alice's numbers.
  const bobProject = await createProject(bob, "IN_PROGRESS");
  await createProject(bob, "IN_PROGRESS");
  await createTasks(bob, bobProject.id, ["PENDING", "PENDING", "PENDING", "COMPLETED", "IN_PROGRESS"]);
}, 30_000);

beforeEach(async () => {
  await resetRateLimits();
});

afterAll(async () => {
  // Deleting the users cascades to their projects and tasks.
  await prisma.users.deleteMany({ where: { email: { startsWith: EMAIL_PREFIX } } });
  await prisma.$disconnect();
});

describe("GET /api/dashboard", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await request(app).get("/api/dashboard");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: { code: "UNAUTHORIZED", message: "Authentication required." } });
  });

  it("returns the documented shape with correct counts for mixed statuses", async () => {
    const res = await dashboard(alice);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: { totalProjects: 4, totalTasks: 7, completedTasks: 3, pendingTasks: 2, projectsInProgress: 2 },
    });
  });

  it("counts only PENDING tasks as pending (IN_PROGRESS and COMPLETED are excluded)", async () => {
    const { data } = (await dashboard(alice)).body;
    const inProgressTasks = data.totalTasks - data.completedTasks - data.pendingTasks;

    expect(inProgressTasks).toBe(2);
    expect(data.pendingTasks).toBe(2);
    expect(data.completedTasks).toBe(3);
  });

  it("excludes other users' projects and tasks, even when a userId is supplied", async () => {
    expect((await dashboard(bob)).body.data).toEqual({
      totalProjects: 2,
      totalTasks: 5,
      completedTasks: 1,
      pendingTasks: 3,
      projectsInProgress: 2,
    });

    const forged = await dashboard(alice, `?userId=${bob.id}`);
    expect(forged.body.data).toMatchObject({ totalProjects: 4, totalTasks: 7 });
  });

  it("returns all zeros for a brand-new user", async () => {
    const fresh = await registerUser("fresh");
    expect((await dashboard(fresh)).body).toEqual({ data: ZERO });
  });

  it("returns zero task counts for a user whose projects have no tasks", async () => {
    const owner = await registerUser("no-tasks");
    await createProject(owner, "IN_PROGRESS");
    await createProject(owner, "NOT_STARTED");

    expect((await dashboard(owner)).body.data).toEqual({ ...ZERO, totalProjects: 2, projectsInProgress: 1 });
  });

  it("reflects task status changes and project deletions", async () => {
    const owner = await registerUser("changes");
    const project = await createProject(owner, "NOT_STARTED");
    const [pending] = await createTasks(owner, project.id, ["PENDING", "IN_PROGRESS"]);

    expect((await dashboard(owner)).body.data).toEqual({ ...ZERO, totalProjects: 1, totalTasks: 2, pendingTasks: 1 });

    await authed(owner, request(app).put(`/api/tasks/${pending.id}`)).send({ status: "COMPLETED" });
    await authed(owner, request(app).put(`/api/projects/${project.id}`)).send({ status: "IN_PROGRESS" });
    expect((await dashboard(owner)).body.data).toEqual({
      totalProjects: 1,
      totalTasks: 2,
      completedTasks: 1,
      pendingTasks: 0,
      projectsInProgress: 1,
    });

    await authed(owner, request(app).delete(`/api/projects/${project.id}`));
    expect((await dashboard(owner)).body.data).toEqual(ZERO);
  });
});
