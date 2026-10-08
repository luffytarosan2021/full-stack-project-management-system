# Cursor Prompts: Backend Phases 0 to 3

Keep this file outside the repo (or in a private notes folder). Run one phase at a time. After each phase: test it, then commit.

---

## Phase 0: Manual setup (you, no AI)

1. Create the repo with this structure and push an empty first commit **after** step 2:
   ```text
   backend/  web/  mobile/  docs/
   AGENTS.md
   .cursor/rules/backend.mdc
   .agents/rules/frontend.md
   .gitignore
   README.md
   ```
2. Create the root `.gitignore` **before the first commit**:
   ```text
   node_modules/
   .env
   .env.*
   !.env.example
   dist/
   build/
   .expo/
   *.apk
   *.log
   .DS_Store
   ```
3. Copy `API.md`, `VALIDATION.md`, `SECURITY.md`, `DESIGN.md` into `docs/` and `schema.prisma` into `backend/prisma/`.
4. Create a **local MySQL 8** database and a dedicated user (not root):
   ```sql
   CREATE DATABASE pms CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
   CREATE USER 'pms_app'@'localhost' IDENTIFIED BY 'choose-a-password';
   GRANT ALL PRIVILEGES ON pms.* TO 'pms_app'@'localhost';
   ```
   (`ALL` on this one database is needed locally for `prisma migrate`.)
5. Pick and create your hosted MySQL now (a free MySQL 8 provider), so you know it works before phase 5. Check its current free-tier terms.
6. Install Bruno (or Thunder Client) for API testing.
7. Generate a JWT secret for local use:
   ```text
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

Done when: repo is pushed, docs are in place, local database exists.

---

## Phase 1: Backend foundation

```text
Read AGENTS.md, docs/API.md, docs/VALIDATION.md, docs/SECURITY.md and backend/prisma/schema.prisma first.

Implement PHASE 1 ONLY: backend foundation. Do not implement auth, projects, tasks or dashboard yet.

Tasks:
1. Initialize backend/ (npm, "type": "module"). Install: express, @prisma/client@6, prisma@6 (dev), zod, bcryptjs, jsonwebtoken, helmet, cors, express-rate-limit, morgan, dotenv. Dev: vitest, supertest, nodemon. Add scripts: dev, start, test, prisma:migrate, prisma:deploy, seed.
2. Create the folder structure from AGENTS.md (config, middleware, routes, controllers, services, validators, utils).
3. config/env.js: load and validate env with Zod (DATABASE_URL, JWT_SECRET min 32 chars, JWT_EXPIRES_IN default "7d", CLIENT_ORIGIN comma-separated list, PORT default 5050, NODE_ENV). Fail at startup with a clear message if invalid. No fallback secrets.
4. config/prisma.js: single Prisma client instance.
5. app.js (exported for tests) with: helmet, trust proxy = 1, cors using the CLIENT_ORIGIN list (also allow requests with no Origin header), morgan, express.json({ limit: "10kb" }), routes mounted under /api, notFound handler, central error handler.
6. utils/AppError.js and the central error handler returning EXACTLY the error format in docs/API.md. Map: Zod errors -> 400 VALIDATION_ERROR with details.fields array; malformed JSON -> 400 VALIDATION_ERROR; body too large -> 413 PAYLOAD_TOO_LARGE; Prisma P2002 -> 409 CONFLICT; P2025 -> 404 NOT_FOUND; anything else -> 500 INTERNAL_SERVER_ERROR with a generic message and no stack trace in production (log the real error server-side).
7. notFound handler: unknown routes return 404 NOT_FOUND in the standard error format.
8. GET /api/health returning { data: { status: "ok" } }.
9. server.js that starts the app and handles graceful shutdown.
10. backend/.env.example with placeholder values for every variable.
11. A vitest + supertest test for /api/health, an unknown route (404 JSON), and malformed JSON (400 JSON).

Run `prisma migrate dev --name init` against my local database after I confirm DATABASE_URL.

At the end, list how I can test this manually and what to commit.
```

Test: `GET /api/health` works; `GET /api/nope` returns JSON 404; sending bad JSON returns JSON 400; app refuses to start with a missing or short `JWT_SECRET`.

---

## Phase 2: Authentication

```text
Read AGENTS.md, docs/API.md, docs/VALIDATION.md and docs/SECURITY.md first. Phase 1 is complete.

Implement PHASE 2 ONLY: authentication. Do not touch projects, tasks or dashboard.

Endpoints (exactly as docs/API.md): POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me.

Requirements:
1. Zod validators per docs/VALIDATION.md: fullName (trim, 1-100), email (trim, lowercase, valid, max 255), password (8-72 BYTES via Buffer.byteLength, never trimmed). Login only needs a present, well-formed email and a non-empty password.
2. bcryptjs with cost 10. Never return or log passwordHash. Use Prisma select.
3. Register: create user, catch Prisma P2002 and return 409 CONFLICT ("An account with this email already exists."), return 201 with { token, user }.
4. Login: look up by lowercase email. If the user does not exist, still run bcrypt.compare against a fixed dummy hash, then return 401 INVALID_CREDENTIALS "Invalid email or password." Identical response for wrong password and unknown email.
5. JWT: sign with HS256, payload contains only the user ID as `sub`, expiry from JWT_EXPIRES_IN. Verify with algorithms ["HS256"].
6. middleware/auth.js: require "Bearer <token>", verify, map TokenExpiredError -> 401 TOKEN_EXPIRED ("Your session has expired. Please log in again."), any other JWT problem or missing header -> 401 UNAUTHORIZED ("Authentication required."), and check the user still exists in the database (deleted user -> UNAUTHORIZED). Attach the user ID to req.
7. Logout: protected, returns the message from docs/API.md. Stateless.
8. Rate limiters per docs/SECURITY.md: login 10 failed attempts/15 min (skipSuccessfulRequests), register 5/hour, general /api limiter 300/15 min. Return 429 RATE_LIMITED in the standard format.
9. Log security events (failed login, 401, 429) with morgan plus a small logger. Never log passwords, tokens or Authorization headers.
10. Tests (vitest + supertest, use a test database or clean up): register success, duplicate email incl. different case -> 409, validation errors (array details), login success, login wrong password and unknown email return identical bodies, /me without token -> 401, /me with garbage token -> 401, /me with expired token (sign one with expiresIn 1s and wait) -> TOKEN_EXPIRED, response never contains passwordHash.

At the end, list manual Bruno tests and what to commit.
```

Test in Bruno: register, login, `/me` with the token, then repeated bad logins until 429. Set `JWT_EXPIRES_IN=30s` once to see `TOKEN_EXPIRED`, then set it back.

---

## Phase 3: Projects, tasks, dashboard, seed

```text
Read AGENTS.md, docs/API.md, docs/VALIDATION.md and docs/SECURITY.md first. Phases 1 and 2 are complete and tested.

Implement PHASE 3 ONLY: projects, tasks, dashboard and the seed script. Do not change auth behavior.

Endpoints exactly as docs/API.md: GET/POST /api/projects, GET/PUT/DELETE /api/projects/:id, GET/POST /api/tasks, GET/PUT/DELETE /api/tasks/:id, GET /api/dashboard. All require the auth middleware.

Requirements:
1. Zod validators per docs/VALIDATION.md for bodies, path params (valid UUID, else 400 VALIDATION_ERROR), and query params (empty value = no filter, repeated/array params -> 400, search max 100). Strip unknown body fields. A PUT with no recognized fields -> 400. Real calendar date check (parse and re-format must equal input). Empty/whitespace description -> null. Never pass req.body to Prisma.
2. Ownership in the database query itself: projects `where: { id, userId }`; tasks `where: { id, project: { userId } }`. Other users' data -> 404 NOT_FOUND. userId only from the JWT.
3. POST /api/tasks: first verify projectId belongs to the user, else 404 and create nothing. PUT /api/tasks ignores projectId.
4. GET /api/tasks with projectId that is not the user's -> 404 NOT_FOUND.
5. Project PUT: if only one of startDate/endDate is sent, validate against the existing other value (endDate >= startDate).
6. Serialization per docs/API.md "Standard Objects": camelCase, dates as plain YYYY-MM-DD strings (use toISOString().slice(0,10) on UTC dates, no local timezone), projects include taskCount and completedTaskCount (use Prisma _count / grouped counts, no N+1 queries), tasks include projectName. description is null when empty.
7. Default sorting: projects createdAt desc then id; tasks dueDate asc then createdAt asc. Search is case-insensitive "contains" on name. Filters combine with AND. Lists return { items, total }.
8. DELETE project relies on database cascade. DELETE responses use the messages from docs/API.md.
9. Dashboard: totalProjects, totalTasks, completedTasks, pendingTasks (PENDING only), projectsInProgress, all scoped to the user, zeros when empty. Use count queries.
10. prisma/seed.js: create a demo user (demo@example.com / Demo@12345), 3 projects with different statuses, and about 10 tasks with varied priorities, statuses and due dates (some overdue). Test data only. Idempotent (safe to run twice).
11. Tests (vitest + supertest) covering every item in docs/SECURITY.md section 17 that applies: cross-user GET/PUT/DELETE on projects and tasks -> 404, creating a task in another user's project -> 404, tasks?projectId of another user -> 404, extra userId/id in body ignored, malformed UUID -> 400, no response contains passwordHash, dashboard counts only own data, filters and search work, date validation (2026-02-30 rejected, endDate < startDate rejected), PUT {} -> 400.

At the end, list manual Bruno tests and what to commit.
```

Test: run the seed, then walk every endpoint in Bruno with the demo user, then repeat key calls as a second user to confirm 404s. Run `npm test` and `npm audit`.

---

## After Phase 3
Deploy the backend (phase 5 in the plan) **before** building the web and mobile apps, so both are built against the real HTTPS API. Then continue with the frontend prompts.
