import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import app from "../src/app.js";
import { env } from "../src/config/env.js";
import { prisma } from "../src/config/prisma.js";
import { resetRateLimits } from "../src/middleware/rateLimiters.js";

const RUN_ID = randomUUID().slice(0, 8);
const EMAIL_DOMAIN = "@example.test";
let emailCounter = 0;
const uniqueEmail = () => `auth-${RUN_ID}-${++emailCounter}${EMAIL_DOMAIN}`;

const PASSWORD = "password123";
const responses = [];

async function send(req) {
  const res = await req;
  responses.push(res);
  return res;
}

const register = (body) => send(request(app).post("/api/auth/register").send(body));
const login = (body) => send(request(app).post("/api/auth/login").send(body));
const me = (authHeader) => {
  const req = request(app).get("/api/auth/me");
  return send(authHeader === undefined ? req : req.set("Authorization", authHeader));
};

async function registerUser(overrides = {}) {
  const body = { fullName: "Test User", email: uniqueEmail(), password: PASSWORD, ...overrides };
  const res = await register(body);
  expect(res.status).toBe(201);
  return { ...res.body.data, password: body.password };
}

const fieldNames = (res) => res.body.error.details.fields.map((f) => f.field);

beforeEach(async () => {
  await resetRateLimits();
});

afterAll(async () => {
  await prisma.users.deleteMany({ where: { email: { startsWith: `auth-${RUN_ID}-` } } });
  await prisma.$disconnect();
});

describe("POST /api/auth/register", () => {
  it("creates an account and returns a token and the safe user profile", async () => {
    const email = uniqueEmail();
    const res = await register({ fullName: "  Diya Shrestha  ", email: `  ${email.toUpperCase()} `, password: PASSWORD });

    expect(res.status).toBe(201);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.user).toEqual({ id: expect.any(String), fullName: "Diya Shrestha", email });
  });

  it("ignores client-supplied id, userId, createdAt, updatedAt and passwordHash", async () => {
    const forgedId = randomUUID();
    const res = await register({
      fullName: "Mass Assign",
      email: uniqueEmail(),
      password: PASSWORD,
      id: forgedId,
      userId: forgedId,
      createdAt: "2000-01-01T00:00:00.000Z",
      updatedAt: "2000-01-01T00:00:00.000Z",
      passwordHash: "not-a-real-hash",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.user.id).not.toBe(forgedId);
    const loginRes = await login({ email: res.body.data.user.email, password: PASSWORD });
    expect(loginRes.status).toBe(200);
  });

  it("returns 409 CONFLICT for a duplicate email, including different letter case", async () => {
    const { user } = await registerUser();
    const res = await register({ fullName: "Someone Else", email: user.email.toUpperCase(), password: PASSWORD });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      error: { code: "CONFLICT", message: "An account with this email already exists." },
    });
  });

  it("returns 400 VALIDATION_ERROR with field errors for missing or invalid input", async () => {
    const res = await register({ fullName: "   ", email: "not-an-email", password: "short" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.message).toBe("Invalid request");
    expect(fieldNames(res).sort()).toEqual(["email", "fullName", "password"]);

    const empty = await register({});
    expect(empty.status).toBe(400);
    expect(fieldNames(empty).sort()).toEqual(["email", "fullName", "password"]);
  });

  it("enforces the documented length limits", async () => {
    const res = await register({
      fullName: "a".repeat(101),
      email: `${"a".repeat(250)}${EMAIL_DOMAIN}`,
      password: "é".repeat(37), // 74 UTF-8 bytes
    });

    expect(res.status).toBe(400);
    expect(fieldNames(res).sort()).toEqual(["email", "fullName", "password"]);

    // 4 characters but 8 bytes: allowed, because the rule is measured in bytes.
    const multibyte = await register({ fullName: "Bytes", email: uniqueEmail(), password: "éééé" });
    expect(multibyte.status).toBe(201);
  });

  it("never trims passwords", async () => {
    const user = await registerUser({ password: "  spaced pass  " });

    expect((await login({ email: user.user.email, password: "  spaced pass  " })).status).toBe(200);
    expect((await login({ email: user.user.email, password: "spaced pass" })).status).toBe(401);
  });
});

describe("POST /api/auth/login", () => {
  it("returns a token and the safe user profile for valid credentials", async () => {
    const { user } = await registerUser();
    const res = await login({ email: `  ${user.email.toUpperCase()}  `, password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.user).toEqual(user);
  });

  it("issues an HS256 JWT whose payload contains only the user ID", async () => {
    const { user } = await registerUser();
    const res = await login({ email: user.email, password: PASSWORD });
    const decoded = jwt.decode(res.body.data.token, { complete: true });

    expect(decoded.header.alg).toBe("HS256");
    expect(Object.keys(decoded.payload).sort()).toEqual(["exp", "iat", "sub"]);
    expect(decoded.payload.sub).toBe(user.id);
  });

  it("returns 401 INVALID_CREDENTIALS for a wrong password", async () => {
    const { user } = await registerUser();
    const res = await login({ email: user.email, password: "wrong-password" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." },
    });
  });

  it("returns the identical response for an unknown email and a wrong password", async () => {
    const { user } = await registerUser();
    const wrongPassword = await login({ email: user.email, password: "wrong-password" });
    const unknownEmail = await login({ email: uniqueEmail(), password: PASSWORD });

    expect(unknownEmail.status).toBe(401);
    expect(unknownEmail.body).toEqual(wrongPassword.body);
  });

  it("returns 400 VALIDATION_ERROR when email or password is missing", async () => {
    const res = await login({});

    expect(res.status).toBe(400);
    expect(fieldNames(res).sort()).toEqual(["email", "password"]);
  });
});

describe("authentication middleware (GET /api/auth/me)", () => {
  const expectUnauthorized = (res) => {
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: { code: "UNAUTHORIZED", message: "Authentication required." } });
  };

  it("returns 401 UNAUTHORIZED without a token", async () => {
    expectUnauthorized(await me());
  });

  it("returns the current user for a valid token", async () => {
    const { token, user } = await registerUser();
    const res = await me(`Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: user });
  });

  it("returns 401 TOKEN_EXPIRED for an expired token", async () => {
    const { user } = await registerUser();
    const expired = jwt.sign({ exp: Math.floor(Date.now() / 1000) - 60 }, env.JWT_SECRET, {
      algorithm: "HS256",
      subject: user.id,
    });
    const res = await me(`Bearer ${expired}`);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      error: { code: "TOKEN_EXPIRED", message: "Your session has expired. Please log in again." },
    });
  });

  it("returns 401 UNAUTHORIZED for malformed and invalid tokens", async () => {
    const { token, user } = await registerUser();
    const wrongSecret = jwt.sign({}, "x".repeat(40), { algorithm: "HS256", subject: user.id });
    const wrongAlgorithm = jwt.sign({}, env.JWT_SECRET, { algorithm: "HS512", subject: user.id });
    const base64url = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
    const unsigned = `${base64url({ alg: "none", typ: "JWT" })}.${base64url({ sub: user.id, exp: 9999999999 })}.`;
    const noSubject = jwt.sign({}, env.JWT_SECRET, { algorithm: "HS256" });

    for (const header of [
      "Bearer not-a-jwt",
      `Bearer ${wrongSecret}`,
      `Bearer ${wrongAlgorithm}`,
      `Bearer ${unsigned}`,
      `Bearer ${noSubject}`,
      `Basic ${token}`,
      token,
      "Bearer ",
    ]) {
      expectUnauthorized(await me(header));
    }
  });

  it("returns 401 UNAUTHORIZED when the user no longer exists", async () => {
    const { token, user } = await registerUser();
    await prisma.users.delete({ where: { id: user.id } });

    expectUnauthorized(await me(`Bearer ${token}`));
  });
});

describe("POST /api/auth/logout", () => {
  it("confirms logout for an authenticated user", async () => {
    const { token } = await registerUser();
    const res = await send(request(app).post("/api/auth/logout").set("Authorization", `Bearer ${token}`));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { message: "Logged out successfully" } });
  });

  it("requires authentication", async () => {
    const res = await send(request(app).post("/api/auth/logout"));

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });
});

describe("authentication rate limits", () => {
  it("blocks login after 10 failed attempts but does not count successful logins", async () => {
    const { user } = await registerUser();

    for (let i = 0; i < 5; i += 1) {
      expect((await login({ email: user.email, password: PASSWORD })).status).toBe(200);
    }
    for (let i = 0; i < 10; i += 1) {
      expect((await login({ email: user.email, password: "wrong-password" })).status).toBe(401);
    }

    const blocked = await login({ email: user.email, password: PASSWORD });
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({
      error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later." },
    });
  }, 30_000);

  it("allows 5 registrations per hour", async () => {
    for (let i = 0; i < 5; i += 1) await registerUser();

    const blocked = await register({ fullName: "Sixth", email: uniqueEmail(), password: PASSWORD });
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe("RATE_LIMITED");
  }, 30_000);
});

describe("response safety", () => {
  it("never returns a password or password hash in any response", () => {
    expect(responses.length).toBeGreaterThan(0);
    for (const res of responses) {
      const body = JSON.stringify(res.body);
      expect(body).not.toMatch(/passwordHash|password_hash|\$2[aby]\$/);
      if (res.body.data) expect(JSON.stringify(res.body.data)).not.toMatch(/password/i);
    }
  });
});
