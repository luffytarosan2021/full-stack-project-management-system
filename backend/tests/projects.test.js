import { randomUUID } from "node:crypto";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { resetRateLimits } from "../src/middleware/rateLimiters.js";

const RUN_ID = randomUUID().slice(0, 8);
const EMAIL_PREFIX = `projects-${RUN_ID}-`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const validProject = (overrides = {}) => ({
  name: "Website Project",
  description: "Build company website",
  status: "NOT_STARTED",
  startDate: "2026-10-07",
  endDate: "2026-11-07",
  ...overrides,
});

let alice;
let bob;

async function registerUser(label) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ fullName: label, email: `${EMAIL_PREFIX}${label}@example.test`, password: "password123" });
  expect(res.status).toBe(201);
  return { ...res.body.data.user, token: res.body.data.token };
}

const api = (user) => ({
  get: (path) => request(app).get(path).set("Authorization", `Bearer ${user.token}`),
  post: (path, body) => request(app).post(path).set("Authorization", `Bearer ${user.token}`).send(body),
  put: (path, body) => request(app).put(path).set("Authorization", `Bearer ${user.token}`).send(body),
  delete: (path) => request(app).delete(path).set("Authorization", `Bearer ${user.token}`),
});

async function createProject(user, overrides) {
  const res = await api(user).post("/api/projects", validProject(overrides));
  expect(res.status).toBe(201);
  return res.body.data;
}

async function addTasks(projectId, statuses) {
  await prisma.tasks.createMany({
    data: statuses.map((status, i) => ({
      id: randomUUID(),
      project_id: projectId,
      name: `Task ${i + 1}`,
      status,
      due_date: new Date("2026-10-15T00:00:00.000Z"),
    })),
  });
}

const fieldNames = (res) => res.body.error.details.fields.map((f) => f.field).sort();
const expectNotFound = (res) => {
  expect(res.status).toBe(404);
  expect(res.body).toEqual({ error: { code: "NOT_FOUND", message: "Project not found." } });
};

beforeAll(async () => {
  alice = await registerUser("alice");
  bob = await registerUser("bob");
});

beforeEach(async () => {
  await resetRateLimits();
});

afterAll(async () => {
  // Deleting the users cascades to their projects and tasks.
  await prisma.users.deleteMany({ where: { email: { startsWith: EMAIL_PREFIX } } });
  await prisma.$disconnect();
});

describe("authentication", () => {
  it("rejects every projects endpoint without a token", async () => {
    const id = randomUUID();
    const responses = await Promise.all([
      request(app).get("/api/projects"),
      request(app).get(`/api/projects/${id}`),
      request(app).post("/api/projects").send(validProject()),
      request(app).put(`/api/projects/${id}`).send({ name: "x" }),
      request(app).delete(`/api/projects/${id}`),
    ]);
    for (const res of responses) {
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    }
  });
});

describe("POST /api/projects", () => {
  it("creates a project for the authenticated user", async () => {
    const res = await api(alice).post("/api/projects", validProject({ name: "  Trimmed Name  " }));

    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({
      id: expect.any(String),
      name: "Trimmed Name",
      description: "Build company website",
      status: "NOT_STARTED",
      startDate: "2026-10-07",
      endDate: "2026-11-07",
      taskCount: 0,
      completedTaskCount: 0,
      createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      updatedAt: expect.stringMatching(/Z$/),
    });
    const stored = await prisma.projects.findUnique({ where: { id: res.body.data.id } });
    expect(stored.user_id).toBe(alice.id);
    expect(Math.abs(new Date(res.body.data.createdAt) - Date.now())).toBeLessThan(60_000);
  });

  it("ignores forged id, userId, createdAt, updatedAt and read-only counts", async () => {
    const forgedId = randomUUID();
    const res = await api(alice).post(
      "/api/projects",
      validProject({
        id: forgedId,
        userId: bob.id,
        user_id: bob.id,
        createdAt: "2000-01-01T00:00:00.000Z",
        updatedAt: "2000-01-01T00:00:00.000Z",
        taskCount: 99,
        completedTaskCount: 42,
        unknownField: "ignored",
      }),
    );

    expect(res.status).toBe(201);
    expect(res.body.data.id).not.toBe(forgedId);
    expect(res.body.data.createdAt).not.toBe("2000-01-01T00:00:00.000Z");
    expect(res.body.data).toMatchObject({ taskCount: 0, completedTaskCount: 0 });
    expect(res.body.data).not.toHaveProperty("unknownField");
    expect((await prisma.projects.findUnique({ where: { id: res.body.data.id } })).user_id).toBe(alice.id);
  });

  it("stores empty or whitespace-only description as null", async () => {
    expect((await createProject(alice, { description: "   " })).description).toBeNull();
    expect((await createProject(alice, { description: undefined })).description).toBeNull();
  });

  it("rejects missing required fields", async () => {
    const res = await api(alice).post("/api/projects", {});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(fieldNames(res)).toEqual(["endDate", "name", "startDate", "status"]);
  });

  it("enforces name and description length limits", async () => {
    const res = await api(alice).post(
      "/api/projects",
      validProject({ name: "a".repeat(151), description: "d".repeat(2001) }),
    );
    expect(res.status).toBe(400);
    expect(fieldNames(res)).toEqual(["description", "name"]);

    const blank = await api(alice).post("/api/projects", validProject({ name: "   " }));
    expect(fieldNames(blank)).toEqual(["name"]);
  });

  it.each([
    ["impossible date", "2026-02-30"],
    ["wrong format", "07/10/2026"],
    ["timestamp", "2026-10-07T00:00:00Z"],
    ["month 13", "2026-13-01"],
  ])("rejects an invalid date (%s)", async (_label, startDate) => {
    const res = await api(alice).post("/api/projects", validProject({ startDate }));
    expect(res.status).toBe(400);
    expect(fieldNames(res)).toEqual(["startDate"]);
  });

  it("accepts leap days and past dates", async () => {
    const project = await createProject(alice, { startDate: "2024-02-29", endDate: "2024-02-29" });
    expect(project).toMatchObject({ startDate: "2024-02-29", endDate: "2024-02-29" });
  });

  it("rejects endDate before startDate", async () => {
    const res = await api(alice).post("/api/projects", validProject({ startDate: "2026-11-08", endDate: "2026-11-07" }));
    expect(res.status).toBe(400);
    expect(res.body.error.details.fields).toEqual([
      { field: "endDate", message: "End date must be on or after start date" },
    ]);
  });

  it("rejects an invalid status (enums are case-sensitive)", async () => {
    for (const status of ["DONE", "in_progress", ""]) {
      const res = await api(alice).post("/api/projects", validProject({ status }));
      expect(res.status).toBe(400);
      expect(fieldNames(res)).toEqual(["status"]);
    }
  });
});

describe("GET /api/projects", () => {
  let owner;
  let other;

  beforeAll(async () => {
    owner = await registerUser("lister");
    other = await registerUser("other");
    await createProject(owner, { name: "Alpha Website", status: "IN_PROGRESS" });
    await sleep(1100); // created_at has one-second precision
    await createProject(owner, { name: "Beta Mobile App", status: "NOT_STARTED" });
    await sleep(1100);
    await createProject(owner, { name: "Gamma website redesign", status: "COMPLETED" });
    await createProject(owner, { name: "100% literal_name", status: "NOT_STARTED" });
    await createProject(other, { name: "Other user's website" });
  }, 20_000);

  const names = (res) => res.body.data.items.map((p) => p.name);

  it("returns only the authenticated user's projects, newest first", async () => {
    const res = await api(owner).get("/api/projects");

    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(4);
    expect(res.body.data.items).toHaveLength(4);
    expect(names(res)).not.toContain("Other user's website");
    expect(names(res).slice(2)).toEqual(["Beta Mobile App", "Alpha Website"]);

    const keys = res.body.data.items.map((p) => [p.createdAt, p.id]);
    const sorted = [...keys].sort((a, b) => (a[0] === b[0] ? a[1].localeCompare(b[1]) : b[0].localeCompare(a[0])));
    expect(keys).toEqual(sorted);
  });

  it("searches names case-insensitively", async () => {
    const res = await api(owner).get("/api/projects?search=WEBSITE");
    expect(names(res).sort()).toEqual(["Alpha Website", "Gamma website redesign"]);
  });

  it("treats LIKE wildcards in search literally", async () => {
    expect(names(await api(owner).get("/api/projects?search=%25"))).toEqual(["100% literal_name"]);
    expect(names(await api(owner).get("/api/projects?search=_"))).toEqual(["100% literal_name"]);
  });

  it("filters by status and combines filters with AND", async () => {
    expect(names(await api(owner).get("/api/projects?status=IN_PROGRESS"))).toEqual(["Alpha Website"]);
    expect(names(await api(owner).get("/api/projects?search=website&status=COMPLETED"))).toEqual([
      "Gamma website redesign",
    ]);
  });

  it("treats empty or whitespace-only filters as no filter", async () => {
    const res = await api(owner).get("/api/projects?search=%20%20&status=");
    expect(res.body.data.total).toBe(4);
  });

  it("rejects invalid, repeated or too-long query values", async () => {
    const bad = await api(owner).get("/api/projects?status=DONE");
    expect(bad.status).toBe(400);
    expect(fieldNames(bad)).toEqual(["status"]);

    const repeated = await api(owner).get("/api/projects?status=COMPLETED&status=IN_PROGRESS");
    expect(repeated.status).toBe(400);
    expect(fieldNames(repeated)).toEqual(["status"]);

    const long = await api(owner).get(`/api/projects?search=${"a".repeat(101)}`);
    expect(long.status).toBe(400);
    expect(fieldNames(long)).toEqual(["search"]);
  });

  it("returns an empty list for a user without projects", async () => {
    const fresh = await registerUser("empty");
    const res = await api(fresh).get("/api/projects");
    expect(res.body).toEqual({ data: { items: [], total: 0 } });
  });
});

describe("task counts", () => {
  it("reports taskCount and completedTaskCount in list and detail", async () => {
    const busy = await createProject(alice, { name: "Counted project" });
    const idle = await createProject(alice, { name: "Idle project" });
    await addTasks(busy.id, ["PENDING", "IN_PROGRESS", "COMPLETED", "COMPLETED", "PENDING"]);

    const detail = await api(alice).get(`/api/projects/${busy.id}`);
    expect(detail.body.data).toMatchObject({ taskCount: 5, completedTaskCount: 2 });

    const list = await api(alice).get("/api/projects");
    const byId = Object.fromEntries(list.body.data.items.map((p) => [p.id, p]));
    expect(byId[busy.id]).toMatchObject({ taskCount: 5, completedTaskCount: 2 });
    expect(byId[idle.id]).toMatchObject({ taskCount: 0, completedTaskCount: 0 });
  });
});

describe("GET /api/projects/:id", () => {
  it("returns the user's own project", async () => {
    const project = await createProject(alice);
    const res = await api(alice).get(`/api/projects/${project.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: project });
  });

  it("returns 404 for another user's project and for a non-existent project", async () => {
    const project = await createProject(alice);
    expectNotFound(await api(bob).get(`/api/projects/${project.id}`));
    expectNotFound(await api(alice).get(`/api/projects/${randomUUID()}`));
  });

  it("returns 400 for a malformed UUID on every :id route", async () => {
    for (const res of [
      await api(alice).get("/api/projects/not-a-uuid"),
      await api(alice).put("/api/projects/123", { name: "x" }),
      await api(alice).delete("/api/projects/abc-def"),
    ]) {
      expect(res.status).toBe(400);
      expect(res.body.error.details.fields).toEqual([{ field: "id", message: "Project ID must be a valid UUID" }]);
    }
  });
});

describe("PUT /api/projects/:id", () => {
  it("updates the user's own project", async () => {
    const project = await createProject(alice);
    const res = await api(alice).put(`/api/projects/${project.id}`, {
      name: "Renamed",
      description: "New description",
      status: "COMPLETED",
      startDate: "2026-10-01",
      endDate: "2026-12-01",
    });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      id: project.id,
      name: "Renamed",
      description: "New description",
      status: "COMPLETED",
      startDate: "2026-10-01",
      endDate: "2026-12-01",
      createdAt: project.createdAt,
    });
  });

  it("applies a partial update and leaves other fields unchanged", async () => {
    const project = await createProject(alice);
    const res = await api(alice).put(`/api/projects/${project.id}`, { status: "IN_PROGRESS" });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ ...project, status: "IN_PROGRESS", updatedAt: expect.any(String) });
  });

  it("sets updatedAt to the current UTC time on every update", async () => {
    const project = await createProject(alice);
    await sleep(1100);
    const res = await api(alice).put(`/api/projects/${project.id}`, { status: project.status });

    const updatedAt = new Date(res.body.data.updatedAt);
    expect(updatedAt > new Date(project.updatedAt)).toBe(true);
    expect(Math.abs(updatedAt - Date.now())).toBeLessThan(60_000);
    expect(res.body.data.createdAt).toBe(project.createdAt);
  });

  it("clears the description with an empty string or null", async () => {
    const project = await createProject(alice);
    const cleared = await api(alice).put(`/api/projects/${project.id}`, { description: "" });
    expect(cleared.body.data.description).toBeNull();

    await api(alice).put(`/api/projects/${project.id}`, { description: "Back again" });
    const nulled = await api(alice).put(`/api/projects/${project.id}`, { description: null });
    expect(nulled.body.data.description).toBeNull();
  });

  it("rejects an empty body or a body with only unknown/read-only fields", async () => {
    const project = await createProject(alice);
    for (const body of [{}, { userId: bob.id, id: randomUUID(), createdAt: "2000-01-01", taskCount: 3 }]) {
      const res = await api(alice).put(`/api/projects/${project.id}`, body);
      expect(res.status).toBe(400);
      expect(res.body.error.details.fields).toEqual([{ field: "body", message: "At least one field must be provided" }]);
    }
  });

  it("ignores unknown fields alongside valid ones and never changes the owner", async () => {
    const project = await createProject(alice);
    const res = await api(alice).put(`/api/projects/${project.id}`, { name: "Kept owner", userId: bob.id, user_id: bob.id });

    expect(res.status).toBe(200);
    expect((await prisma.projects.findUnique({ where: { id: project.id } })).user_id).toBe(alice.id);
  });

  it("validates supplied fields", async () => {
    const project = await createProject(alice);
    const res = await api(alice).put(`/api/projects/${project.id}`, {
      name: "",
      status: "DONE",
      startDate: "2026-02-30",
    });
    expect(res.status).toBe(400);
    expect(fieldNames(res)).toEqual(["name", "startDate", "status"]);
  });

  it("validates a single supplied date against the stored other date", async () => {
    const project = await createProject(alice, { startDate: "2026-10-07", endDate: "2026-11-07" });

    const badEnd = await api(alice).put(`/api/projects/${project.id}`, { endDate: "2026-10-01" });
    expect(badEnd.status).toBe(400);
    expect(badEnd.body.error.details.fields).toEqual([
      { field: "endDate", message: "End date must be on or after start date" },
    ]);

    const badStart = await api(alice).put(`/api/projects/${project.id}`, { startDate: "2026-12-01" });
    expect(badStart.status).toBe(400);
    expect(fieldNames(badStart)).toEqual(["startDate"]);

    const ok = await api(alice).put(`/api/projects/${project.id}`, { endDate: "2026-10-07" });
    expect(ok.status).toBe(200);
  });

  it("returns 404 when updating another user's project and leaves it unchanged", async () => {
    const project = await createProject(alice);
    expectNotFound(await api(bob).put(`/api/projects/${project.id}`, { name: "Hijacked" }));
    expect((await api(alice).get(`/api/projects/${project.id}`)).body.data.name).toBe(project.name);
  });
});

describe("DELETE /api/projects/:id", () => {
  it("deletes the user's own project", async () => {
    const project = await createProject(alice);
    const res = await api(alice).delete(`/api/projects/${project.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { message: "Project deleted successfully" } });
    expectNotFound(await api(alice).get(`/api/projects/${project.id}`));
    expectNotFound(await api(alice).delete(`/api/projects/${project.id}`));
  });

  it("returns 404 when deleting another user's project and keeps it", async () => {
    const project = await createProject(alice);
    expectNotFound(await api(bob).delete(`/api/projects/${project.id}`));
    expect((await api(alice).get(`/api/projects/${project.id}`)).status).toBe(200);
  });

  it("cascades the delete to the project's tasks", async () => {
    const project = await createProject(alice);
    const keep = await createProject(alice, { name: "Untouched" });
    await addTasks(project.id, ["PENDING", "COMPLETED", "IN_PROGRESS"]);
    await addTasks(keep.id, ["PENDING"]);

    await api(alice).delete(`/api/projects/${project.id}`);

    expect(await prisma.tasks.count({ where: { project_id: project.id } })).toBe(0);
    expect(await prisma.tasks.count({ where: { project_id: keep.id } })).toBe(1);
  });
});
