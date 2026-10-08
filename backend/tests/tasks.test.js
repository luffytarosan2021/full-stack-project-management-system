import { randomUUID } from "node:crypto";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { resetRateLimits } from "../src/middleware/rateLimiters.js";

const RUN_ID = randomUUID().slice(0, 8);
const EMAIL_PREFIX = `tasks-${RUN_ID}-`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const responses = [];

let alice;
let bob;
let aliceProject;
let aliceOtherProject;
let bobProject;

async function track(req) {
  const res = await req;
  responses.push(res);
  return res;
}

const api = (user) => {
  const auth = (req) => track(req.set("Authorization", `Bearer ${user.token}`));
  return {
    get: (path) => auth(request(app).get(path)),
    post: (path, body) => auth(request(app).post(path).send(body)),
    put: (path, body) => auth(request(app).put(path).send(body)),
    delete: (path) => auth(request(app).delete(path)),
  };
};

async function registerUser(label) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ fullName: label, email: `${EMAIL_PREFIX}${label}@example.test`, password: "password123" });
  expect(res.status).toBe(201);
  return { ...res.body.data.user, token: res.body.data.token };
}

async function createProject(user, name) {
  const res = await api(user).post("/api/projects", {
    name,
    status: "IN_PROGRESS",
    startDate: "2026-10-01",
    endDate: "2026-12-31",
  });
  expect(res.status).toBe(201);
  return res.body.data;
}

const validTask = (projectId, overrides = {}) => ({
  projectId,
  name: "Design homepage",
  description: "Create homepage design",
  priority: "HIGH",
  status: "PENDING",
  dueDate: "2026-10-15",
  ...overrides,
});

async function createTask(user, projectId, overrides) {
  const res = await api(user).post("/api/tasks", validTask(projectId, overrides));
  expect(res.status).toBe(201);
  return res.body.data;
}

const fieldNames = (res) => res.body.error.details.fields.map((f) => f.field).sort();
const expectNotFound = (res, message = "Task not found.") => {
  expect(res.status).toBe(404);
  expect(res.body).toEqual({ error: { code: "NOT_FOUND", message } });
};

beforeAll(async () => {
  alice = await registerUser("alice");
  bob = await registerUser("bob");
  aliceProject = await createProject(alice, "Website Project");
  aliceOtherProject = await createProject(alice, "Mobile Project");
  bobProject = await createProject(bob, "Bob's Project");
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
  it("rejects every tasks endpoint without a token", async () => {
    const id = randomUUID();
    const results = await Promise.all([
      request(app).get("/api/tasks"),
      request(app).get(`/api/tasks/${id}`),
      request(app).post("/api/tasks").send(validTask(randomUUID())),
      request(app).put(`/api/tasks/${id}`).send({ status: "COMPLETED" }),
      request(app).delete(`/api/tasks/${id}`),
    ]);
    for (const res of results) {
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    }
  });
});

describe("POST /api/tasks", () => {
  it("creates a task in the user's own project", async () => {
    const res = await api(alice).post("/api/tasks", validTask(aliceProject.id, { name: "  Trimmed  " }));

    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({
      id: expect.any(String),
      projectId: aliceProject.id,
      projectName: "Website Project",
      name: "Trimmed",
      description: "Create homepage design",
      priority: "HIGH",
      status: "PENDING",
      dueDate: "2026-10-15",
      createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      updatedAt: expect.stringMatching(/Z$/),
    });
    expect(Math.abs(new Date(res.body.data.createdAt) - Date.now())).toBeLessThan(60_000);
  });

  it("requires projectId", async () => {
    const { projectId: _omit, ...body } = validTask(aliceProject.id);
    const res = await api(alice).post("/api/tasks", body);

    expect(res.status).toBe(400);
    expect(res.body.error.details.fields).toEqual([{ field: "projectId", message: "Project ID is required" }]);

    const malformed = await api(alice).post("/api/tasks", validTask("not-a-uuid"));
    expect(malformed.body.error.details.fields).toEqual([
      { field: "projectId", message: "Project ID must be a valid UUID" },
    ]);
  });

  it("returns 404 and creates nothing in another user's or a non-existent project", async () => {
    const before = await prisma.tasks.count({ where: { project_id: bobProject.id } });

    expectNotFound(await api(alice).post("/api/tasks", validTask(bobProject.id)), "Project not found.");
    expectNotFound(await api(alice).post("/api/tasks", validTask(randomUUID())), "Project not found.");
    expect(await prisma.tasks.count({ where: { project_id: bobProject.id } })).toBe(before);
  });

  it("ignores forged id, userId, createdAt, updatedAt and projectName", async () => {
    const forgedId = randomUUID();
    const res = await api(alice).post(
      "/api/tasks",
      validTask(aliceProject.id, {
        id: forgedId,
        userId: bob.id,
        user_id: bob.id,
        createdAt: "2000-01-01T00:00:00.000Z",
        updatedAt: "2000-01-01T00:00:00.000Z",
        projectName: "Forged",
      }),
    );

    expect(res.status).toBe(201);
    expect(res.body.data.id).not.toBe(forgedId);
    expect(res.body.data.projectName).toBe("Website Project");
    expect(res.body.data.createdAt).not.toBe("2000-01-01T00:00:00.000Z");
  });

  it("rejects missing required fields and enforces length limits", async () => {
    const empty = await api(alice).post("/api/tasks", {});
    expect(empty.status).toBe(400);
    expect(fieldNames(empty)).toEqual(["dueDate", "name", "priority", "projectId", "status"]);

    const long = await api(alice).post(
      "/api/tasks",
      validTask(aliceProject.id, { name: "a".repeat(151), description: "d".repeat(2001) }),
    );
    expect(fieldNames(long)).toEqual(["description", "name"]);

    const blank = await api(alice).post("/api/tasks", validTask(aliceProject.id, { name: "   " }));
    expect(fieldNames(blank)).toEqual(["name"]);
  });

  it("stores an empty description as null", async () => {
    expect((await createTask(alice, aliceProject.id, { description: "  " })).description).toBeNull();
  });

  it.each(["2026-02-30", "2026-13-01", "15/10/2026", "2026-10-15T00:00:00Z"])(
    "rejects an invalid due date (%s)",
    async (dueDate) => {
      const res = await api(alice).post("/api/tasks", validTask(aliceProject.id, { dueDate }));
      expect(res.status).toBe(400);
      expect(fieldNames(res)).toEqual(["dueDate"]);
    },
  );

  it("allows past due dates", async () => {
    expect((await createTask(alice, aliceProject.id, { dueDate: "2020-01-31" })).dueDate).toBe("2020-01-31");
  });

  it("rejects an invalid priority or status (case-sensitive)", async () => {
    for (const priority of ["URGENT", "high", ""]) {
      const res = await api(alice).post("/api/tasks", validTask(aliceProject.id, { priority }));
      expect(fieldNames(res)).toEqual(["priority"]);
    }
    for (const status of ["DONE", "completed", "NOT_STARTED"]) {
      const res = await api(alice).post("/api/tasks", validTask(aliceProject.id, { status }));
      expect(fieldNames(res)).toEqual(["status"]);
    }
  });
});

describe("GET /api/tasks", () => {
  let owner;
  let other;
  let projectA;
  let projectB;

  beforeAll(async () => {
    owner = await registerUser("lister");
    other = await registerUser("outsider");
    projectA = await createProject(owner, "Project A");
    projectB = await createProject(owner, "Project B");
    const outsiderProject = await createProject(other, "Outsider");

    await createTask(owner, projectA.id, { name: "Write docs", dueDate: "2026-10-20", priority: "LOW", status: "PENDING" });
    await createTask(owner, projectA.id, { name: "Fix login bug", dueDate: "2026-10-10", priority: "HIGH", status: "IN_PROGRESS" });
    await sleep(1100); // created_at has one-second precision
    await createTask(owner, projectB.id, { name: "Design login screen", dueDate: "2026-10-10", priority: "MEDIUM", status: "COMPLETED" });
    await createTask(owner, projectB.id, { name: "100% literal_name", dueDate: "2026-11-01", priority: "HIGH", status: "PENDING" });
    await createTask(other, outsiderProject.id, { name: "Outsider login task" });
  }, 20_000);

  const names = (res) => res.body.data.items.map((t) => t.name);

  it("returns only the user's tasks, sorted by dueDate then createdAt", async () => {
    const res = await api(owner).get("/api/tasks");

    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(4);
    expect(names(res)).toEqual(["Fix login bug", "Design login screen", "Write docs", "100% literal_name"]);
    expect(res.body.data.items.map((t) => t.projectName)).toEqual(["Project A", "Project B", "Project A", "Project B"]);
  });

  it("filters by projectId", async () => {
    const res = await api(owner).get(`/api/tasks?projectId=${projectB.id}`);
    expect(names(res)).toEqual(["Design login screen", "100% literal_name"]);
  });

  it("returns 404 for another user's or an unknown projectId, and 400 for a malformed one", async () => {
    expectNotFound(await api(other).get(`/api/tasks?projectId=${projectA.id}`), "Project not found.");
    expectNotFound(await api(owner).get(`/api/tasks?projectId=${randomUUID()}`), "Project not found.");

    const malformed = await api(owner).get("/api/tasks?projectId=abc");
    expect(malformed.status).toBe(400);
    expect(fieldNames(malformed)).toEqual(["projectId"]);
  });

  it("searches names case-insensitively and treats wildcards literally", async () => {
    expect(names(await api(owner).get("/api/tasks?search=LOGIN"))).toEqual(["Fix login bug", "Design login screen"]);
    expect(names(await api(owner).get("/api/tasks?search=%25"))).toEqual(["100% literal_name"]);
    expect(names(await api(owner).get("/api/tasks?search=_"))).toEqual(["100% literal_name"]);
  });

  it("filters by status and by priority", async () => {
    expect(names(await api(owner).get("/api/tasks?status=COMPLETED"))).toEqual(["Design login screen"]);
    expect(names(await api(owner).get("/api/tasks?priority=HIGH"))).toEqual(["Fix login bug", "100% literal_name"]);
  });

  it("combines filters with AND", async () => {
    const res = await api(owner).get(`/api/tasks?projectId=${projectA.id}&search=login&status=IN_PROGRESS&priority=HIGH`);
    expect(names(res)).toEqual(["Fix login bug"]);

    const none = await api(owner).get(`/api/tasks?projectId=${projectA.id}&priority=MEDIUM`);
    expect(none.body.data).toEqual({ items: [], total: 0 });
  });

  it("treats empty filter values as no filter", async () => {
    const res = await api(owner).get("/api/tasks?projectId=&search=%20&status=&priority=");
    expect(res.body.data.total).toBe(4);
  });

  it("rejects invalid, repeated or too-long query values", async () => {
    expect(fieldNames(await api(owner).get("/api/tasks?status=DONE"))).toEqual(["status"]);
    expect(fieldNames(await api(owner).get("/api/tasks?priority=URGENT"))).toEqual(["priority"]);
    expect(fieldNames(await api(owner).get("/api/tasks?priority=LOW&priority=HIGH"))).toEqual(["priority"]);
    expect(fieldNames(await api(owner).get(`/api/tasks?search=${"a".repeat(101)}`))).toEqual(["search"]);
  });

  it("returns an empty list for a user without tasks", async () => {
    const fresh = await registerUser("fresh");
    expect((await api(fresh).get("/api/tasks")).body).toEqual({ data: { items: [], total: 0 } });
  });
});

describe("GET /api/tasks/:id", () => {
  it("returns the user's own task", async () => {
    const task = await createTask(alice, aliceProject.id);
    const res = await api(alice).get(`/api/tasks/${task.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: task });
  });

  it("returns 404 for another user's task and for a non-existent task", async () => {
    const task = await createTask(alice, aliceProject.id);
    expectNotFound(await api(bob).get(`/api/tasks/${task.id}`));
    expectNotFound(await api(alice).get(`/api/tasks/${randomUUID()}`));
  });

  it("returns 400 for a malformed UUID on every :id route", async () => {
    for (const res of [
      await api(alice).get("/api/tasks/not-a-uuid"),
      await api(alice).put("/api/tasks/123", { status: "COMPLETED" }),
      await api(alice).delete("/api/tasks/xyz"),
    ]) {
      expect(res.status).toBe(400);
      expect(res.body.error.details.fields).toEqual([{ field: "id", message: "Task ID must be a valid UUID" }]);
    }
  });
});

describe("PUT /api/tasks/:id", () => {
  it("updates the user's own task", async () => {
    const task = await createTask(alice, aliceProject.id);
    const res = await api(alice).put(`/api/tasks/${task.id}`, {
      name: "Renamed",
      description: "Updated",
      priority: "LOW",
      status: "IN_PROGRESS",
      dueDate: "2026-12-24",
    });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      id: task.id,
      projectId: aliceProject.id,
      name: "Renamed",
      description: "Updated",
      priority: "LOW",
      status: "IN_PROGRESS",
      dueDate: "2026-12-24",
      createdAt: task.createdAt,
    });
  });

  it("marks a task COMPLETED with a partial update and leaves other fields unchanged", async () => {
    const task = await createTask(alice, aliceProject.id);
    const res = await api(alice).put(`/api/tasks/${task.id}`, { status: "COMPLETED" });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ ...task, status: "COMPLETED", updatedAt: expect.any(String) });
  });

  it("changes only the priority", async () => {
    const task = await createTask(alice, aliceProject.id, { priority: "LOW" });
    const res = await api(alice).put(`/api/tasks/${task.id}`, { priority: "HIGH" });
    expect(res.body.data).toEqual({ ...task, priority: "HIGH", updatedAt: expect.any(String) });
  });

  it("clears the description with an empty string or null", async () => {
    const task = await createTask(alice, aliceProject.id);
    expect((await api(alice).put(`/api/tasks/${task.id}`, { description: "" })).body.data.description).toBeNull();

    await api(alice).put(`/api/tasks/${task.id}`, { description: "Again" });
    expect((await api(alice).put(`/api/tasks/${task.id}`, { description: null })).body.data.description).toBeNull();
  });

  it("rejects an empty body, including one with only ignored fields such as projectId", async () => {
    const task = await createTask(alice, aliceProject.id);
    for (const body of [{}, { projectId: aliceOtherProject.id, userId: bob.id, id: randomUUID() }]) {
      const res = await api(alice).put(`/api/tasks/${task.id}`, body);
      expect(res.status).toBe(400);
      expect(res.body.error.details.fields).toEqual([{ field: "body", message: "At least one field must be provided" }]);
    }
  });

  it("ignores projectId so a task cannot be moved to another project", async () => {
    const task = await createTask(alice, aliceProject.id);
    for (const projectId of [aliceOtherProject.id, bobProject.id]) {
      const res = await api(alice).put(`/api/tasks/${task.id}`, { name: "Still here", projectId });
      expect(res.status).toBe(200);
      expect(res.body.data.projectId).toBe(aliceProject.id);
    }
    expect((await prisma.tasks.findUnique({ where: { id: task.id } })).project_id).toBe(aliceProject.id);
  });

  it("validates supplied fields", async () => {
    const task = await createTask(alice, aliceProject.id);
    const res = await api(alice).put(`/api/tasks/${task.id}`, {
      name: "",
      priority: "URGENT",
      status: "DONE",
      dueDate: "2026-02-30",
    });
    expect(res.status).toBe(400);
    expect(fieldNames(res)).toEqual(["dueDate", "name", "priority", "status"]);
  });

  it("sets updatedAt to the current UTC time on every update", async () => {
    const task = await createTask(alice, aliceProject.id);
    await sleep(1100);
    const res = await api(alice).put(`/api/tasks/${task.id}`, { status: task.status });

    const updatedAt = new Date(res.body.data.updatedAt);
    expect(updatedAt > new Date(task.updatedAt)).toBe(true);
    expect(Math.abs(updatedAt - Date.now())).toBeLessThan(60_000);
    expect(res.body.data.createdAt).toBe(task.createdAt);
  });

  it("returns 404 when updating another user's task and leaves it unchanged", async () => {
    const task = await createTask(alice, aliceProject.id);
    expectNotFound(await api(bob).put(`/api/tasks/${task.id}`, { status: "COMPLETED" }));
    expect((await api(alice).get(`/api/tasks/${task.id}`)).body.data.status).toBe("PENDING");
  });
});

describe("DELETE /api/tasks/:id", () => {
  it("deletes the user's own task, which then returns 404", async () => {
    const task = await createTask(alice, aliceProject.id);
    const res = await api(alice).delete(`/api/tasks/${task.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { message: "Task deleted successfully" } });
    expectNotFound(await api(alice).get(`/api/tasks/${task.id}`));
    expectNotFound(await api(alice).delete(`/api/tasks/${task.id}`));
  });

  it("returns 404 when deleting another user's task and keeps it", async () => {
    const task = await createTask(alice, aliceProject.id);
    expectNotFound(await api(bob).delete(`/api/tasks/${task.id}`));
    expect((await api(alice).get(`/api/tasks/${task.id}`)).status).toBe(200);
  });
});

describe("security", () => {
  it("checks ownership through the project, not a client-supplied user", async () => {
    const task = await createTask(alice, aliceProject.id);

    // Bob only ever sees his own project's tasks, whatever he sends.
    const list = await api(bob).get(`/api/tasks?userId=${alice.id}`);
    expect(list.body.data.items.every((t) => t.projectId === bobProject.id)).toBe(true);
    expect(list.body.data.items.map((t) => t.id)).not.toContain(task.id);

    // Bob creating a task "for Alice" in his own project still lands in his project.
    const created = await api(bob).post("/api/tasks", validTask(bobProject.id, { userId: alice.id }));
    expect(created.status).toBe(201);
    expect((await prisma.projects.findUnique({ where: { id: created.body.data.projectId } })).user_id).toBe(bob.id);
  });

  it("never returns passwords, password hashes or tokens from task endpoints", () => {
    const taskResponses = responses.filter((res) => res.req.path.startsWith("/api/tasks"));
    expect(taskResponses.length).toBeGreaterThan(20);
    for (const res of taskResponses) {
      expect(JSON.stringify(res.body)).not.toMatch(/password|passwordHash|password_hash|token|\$2[aby]\$|eyJ/i);
    }
  });
});
