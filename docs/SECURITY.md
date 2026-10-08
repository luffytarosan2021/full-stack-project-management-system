# Project Management System: Security Rules

These rules apply to the backend, and to how the web and mobile clients handle authentication. Every implementation phase must follow them.

Related documents: `docs/API.md`, `docs/VALIDATION.md`, `backend/prisma/schema.prisma`.

Security requirements take priority over convenience.

---

## 1. Passwords

- Hash with `bcryptjs`, **cost factor 12**.
- Never store plain-text passwords.
- Never return `passwordHash` in any response. Use Prisma `select` so it is never fetched for response objects.
- Never log passwords or hashes, and never include them in error messages.
- Length rules (8 to 72 bytes) are in `docs/VALIDATION.md`. Passwords are never trimmed.

---

## 2. JWT Authentication

- Header: `Authorization: Bearer <token>`.
- Sign and verify with an explicit algorithm: `HS256`. Verification must restrict `algorithms: ["HS256"]`.
- Payload contains **only the user ID** (`sub`). No email, name or other data.
- `JWT_SECRET` comes from the environment, must be **at least 32 characters**, and the server **fails to start** if it is missing or too short. No hardcoded or fallback secret.
- `JWT_EXPIRES_IN` comes from the environment:
  - Production default: `7d`
  - To test expiry locally: `30s`

---

## 3. Authentication Middleware

All protected routes pass through one authentication middleware that:

1. Reads the `Authorization` header and requires the `Bearer <token>` format.
2. Verifies signature and expiry.
3. Extracts the user ID.
4. **Checks that the user still exists in the database** (a token for a deleted account is rejected).
5. Attaches the user ID to the request.

Error mapping (HTTP 401):

| Situation | Code |
|---|---|
| Missing header, wrong format, bad signature, unknown user | `UNAUTHORIZED` ("Authentication required.") |
| `TokenExpiredError` | `TOKEN_EXPIRED` ("Your session has expired. Please log in again.") |

---

## 4. Authorization and Ownership

Authentication says who the user is. Authorization says what they may access.

- **Project:** `project.userId` must equal the authenticated user's ID for view, update, delete, and for creating or listing its tasks.
- **Task:** tasks have no `userId`. Ownership is checked through `task.project.userId`. Every task query must filter on the project relation, e.g. `where: { id, project: { userId } }`.
- **Task creation:** `POST /api/tasks` must first confirm `projectId` belongs to the user. If not, return `404 NOT_FOUND` and create nothing.
- **Task listing with `projectId`:** if the project is not the user's, return `404 NOT_FOUND`.
- Other users' resources always return **`404 NOT_FOUND`**, never `403`.
- Ownership filters go **inside the database query**, not applied after fetching.

---

## 5. Input Validation and Mass Assignment

- Validate every body, path parameter and query parameter with Zod (rules in `docs/VALIDATION.md`).
- **Never pass `req.body` directly to Prisma.** Parse it with a Zod schema first and use only the parsed result.
- Clients can never set `id`, `userId` (or `user_id`), `createdAt`, `updatedAt`. The user ID comes from the JWT only.
- Limit JSON bodies: `express.json({ limit: "10kb" })`.
- Handle malformed JSON and unknown routes with the standard error format.

---

## 6. SQL Injection

- All database access goes through Prisma.
- Never build SQL by concatenating user input.
- **Never use `$queryRawUnsafe` or `$executeRawUnsafe`.**
- If raw SQL is ever unavoidable, use only the tagged-template `$queryRaw` / `$executeRaw`, which parameterizes values.

---

## 7. Email and Login Behavior

- Trim and lowercase emails before storing or comparing.
- The database enforces uniqueness. On registration, **catch the unique-constraint error (Prisma `P2002`) and return `409 CONFLICT`**. Do not rely only on a check-then-insert (race condition).
- Login failures always return `401 INVALID_CREDENTIALS` with the message `Invalid email or password.`
- **Constant-time-ish login:** if the email is not found, still run a bcrypt comparison against a fixed dummy hash, so response time does not reveal whether the email exists.

---

## 7a. Error Handling

- A central error handler returns the standard format from `docs/API.md`.
- Map known errors: Prisma `P2002` to 409, Prisma `P2025` to 404, Zod errors to 400, JWT errors per section 3.
- Everything else returns `500 INTERNAL_SERVER_ERROR` with a generic message.
- In production, responses never include stack traces, file paths, SQL, Prisma messages or connection details. The full error is logged server-side only.

---

## 8. HTTP Hardening

- Use **Helmet** on the Express app.
- Set `app.set("trust proxy", 1)` when behind a hosting proxy. Without it, rate limiting treats all users as one IP.
- Production traffic uses **HTTPS** only. The mobile app must point to the `https://` backend URL in production (Android blocks cleartext HTTP by default).

---

## 9. CORS

- `CLIENT_ORIGIN` is a **comma-separated list** of allowed web origins (for example local dev plus the deployed web URL).
- Never use `origin: "*"`.
- Requests with **no `Origin` header** (native mobile app, API testing tools) are allowed. CORS is a browser mechanism and does not apply to the native app, so no CORS change is needed for mobile.
- Only the web origins listed in `CLIENT_ORIGIN` are allowed from browsers.

---

## 10. Rate Limiting

Use `express-rate-limit`, keyed by IP.

| Scope | Limit |
|---|---|
| `POST /api/auth/login` | 10 failed attempts per 15 minutes (`skipSuccessfulRequests: true`) |
| `POST /api/auth/register` | 5 requests per hour |
| All other `/api` routes | 300 requests per 15 minutes |

Exceeded limits return `429 RATE_LIMITED` in the standard format. Limits are generous enough that a reviewer who mistypes a password a few times, or several people on one network, are not locked out.

---

## 11. Logging

- Use **Morgan** for HTTP request logging.
- Also log security events (without secrets): failed logins, `401`, `404` on ownership failures, `429`, and unexpected `500` errors.
- **Never log:** passwords, password hashes, JWTs, `Authorization` headers, request bodies of auth routes, database credentials or any secret.

---

## 12. Environment Variables

Backend variables:

```env
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
CLIENT_ORIGIN=
PORT=
NODE_ENV=
```

- Commit only `.env.example` (with placeholder values).
- `.gitignore` must include `.env` and `.env.*`, while allowing `.env.example`.
- Check `.gitignore` **before the first commit**. If a secret is ever committed to the public repo, rotate it. Deleting the file does not remove it from Git history.
- Read `PORT` from the environment (hosts assign it).

---

## 13. Database Security

- The app connects as a **dedicated MySQL user** with privileges only on its own database. Never connect as `root`.
- Use SSL for the database connection if the host supports it.
- The schema uses primary keys, foreign keys, a unique constraint on `users.email`, indexes on `projects.user_id` and `tasks.project_id`, and `ON DELETE CASCADE` as defined in `schema.prisma`.
- `schema.prisma` and `docs/schema.sql` must stay consistent.

---

## 14. Client Token Handling

### Mobile
- Store the JWT with **`expo-secure-store`** (Android Keystore / iOS Keychain).
- Never store the token in AsyncStorage or any plain storage.

### Web
- Decision: the JWT is kept as a **Bearer token in `localStorage`**.
- Trade-off: `localStorage` can be read by injected scripts (XSS). httpOnly cookies are safer against that but add complexity for a shared web and mobile API.
- Mitigations: never use `dangerouslySetInnerHTML`, render all user content as plain text (React escapes by default), keep dependencies updated, and set a Content-Security-Policy on the web host if possible.
- This trade-off is stated in the README.

### Both
- On `401 TOKEN_EXPIRED`: clear the token and user state, redirect to login, show `Your session has expired. Please log in again.`, and do not retry with the expired token.
- On logout: delete the stored token and user state regardless of the server response.

---

## 15. Network Failure (Mobile)

When there is no network, show:

```text
No internet connection.
Please check your connection and try again.
```

Never show raw error objects, stack traces or technical details to users.

---

## 16. Dependencies

- Run `npm audit` before submission and fix serious issues.
- Commit lockfiles.
- Enable GitHub Dependabot alerts.

---

## 17. Required Security Tests

Run these before submission. All cross-user checks must return `404 NOT_FOUND` and expose no data.

1. Protected endpoints return `401` with no token, a malformed token, or a token signed with a wrong secret.
2. An expired token returns `401 TOKEN_EXPIRED`. (Test with `JWT_EXPIRES_IN=30s`; both clients must redirect to login with the correct message.)
3. A token belonging to a deleted user returns `401 UNAUTHORIZED`.
4. User B cannot GET, PUT or DELETE User A's project.
5. User B cannot GET, PUT or DELETE User A's task.
6. User B cannot create a task in User A's project.
7. `GET /api/tasks?projectId=<User A's project>` as User B returns `404`.
8. Sending `userId`, `id` or `createdAt` in a request body has no effect.
9. A malformed UUID in the path returns `400`.
10. No API response ever contains `passwordHash` or `password`.
11. Registering a duplicate email (including different letter case) returns `409`.
12. Repeated failed logins beyond the limit return `429`.
13. Login with an unknown email and login with a wrong password return the identical error response.
14. Dashboard counts include only the authenticated user's data.

---

## 18. Known Limitations (state these in the README)

- Logout is client-side: JWTs are stateless and are not revoked server-side before expiry.
- No refresh tokens. The user logs in again after expiry.
- The web token is stored in `localStorage` (see section 14).
- Rate limiting is per IP and uses in-memory storage, so it resets on server restart and is not shared across multiple server instances.
- Registration reveals whether an email is already registered (the `409` response). This is an accepted usability trade-off.

---

## 19. Rules for AI Coding Agents

When modifying code, AI coding agents must:

1. Follow this document, `docs/API.md` and `docs/VALIDATION.md`.
2. Never weaken authentication or bypass authorization checks.
3. Never expose passwords, hashes or secrets, and never add hardcoded credentials.
4. Never disable validation to make a feature work.
5. Never pass `req.body` directly to the database layer.
6. Never use `$queryRawUnsafe` or string-built SQL.
7. Never change ownership logic or the authentication mechanism without explicit approval.
8. Never change security-sensitive behavior silently.
9. Ask before making security-related architectural changes.