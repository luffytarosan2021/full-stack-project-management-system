import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app.js";

describe("GET /api/health", () => {
  it("returns 200 with the documented body", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { status: "ok" } });
  });
});

describe("unknown routes", () => {
  it("return 404 NOT_FOUND in the standard error format", async () => {
    const res = await request(app).get("/api/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.body).toEqual({
      error: { code: "NOT_FOUND", message: expect.any(String) },
    });
  });
});

describe("request body parsing", () => {
  it("returns 400 VALIDATION_ERROR for malformed JSON", async () => {
    const res = await request(app)
      .post("/api/health")
      .set("Content-Type", "application/json")
      .send('{"name": ');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(Array.isArray(res.body.error.details.fields)).toBe(true);
    expect(res.body.error.details.fields.length).toBeGreaterThan(0);
    expect(JSON.stringify(res.body)).not.toMatch(/stack|SyntaxError/);
  });

  it("returns 413 PAYLOAD_TOO_LARGE for bodies over 10kb", async () => {
    const res = await request(app)
      .post("/api/health")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({ text: "a".repeat(11 * 1024) }));

    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe("PAYLOAD_TOO_LARGE");
  });
});
