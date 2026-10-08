# Project Management System: API Contract

This is the single source of truth for the REST API. The backend, web app and mobile app must all follow it exactly.

Related documents: `docs/VALIDATION.md`, `docs/SECURITY.md`, `backend/prisma/schema.prisma`.

---

## 1. Endpoint Summary

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | No | Health check / wake-up ping |
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Log in |
| POST | `/api/auth/logout` | Yes | Confirm logout |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/projects` | Yes | List own projects (search, filter) |
| GET | `/api/projects/:id` | Yes | Project details |
| POST | `/api/projects` | Yes | Create project |
| PUT | `/api/projects/:id` | Yes | Update project (partial) |
| DELETE | `/api/projects/:id` | Yes | Delete project and its tasks |
| GET | `/api/tasks` | Yes | List own tasks (search, filters) |
| GET | `/api/tasks/:id` | Yes | Task details |
| POST | `/api/tasks` | Yes | Create task |
| PUT | `/api/tasks/:id` | Yes | Update task (partial) |
| DELETE | `/api/tasks/:id` | Yes | Delete task |
| GET | `/api/dashboard` | Yes | Dashboard statistics |

---

## 2. Global Conventions

### Base path and authentication
- Base path: `/api`
- Protected endpoints require: `Authorization: Bearer <JWT_TOKEN>`
- Request and response bodies are JSON (`Content-Type: application/json`).

### Field naming
- API JSON uses **camelCase** (`fullName`, `projectId`, `dueDate`, `createdAt`).
- The MySQL database (and the Prisma models) use **snake_case**. The backend serializers map between them.

### Dates
- Date-only fields: `YYYY-MM-DD` (example: `2026-10-07`). No timestamps, no timezone.
- Timestamp fields: ISO 8601 UTC (example: `2026-10-07T10:30:00.000Z`).
- Date-only values are sent and returned as plain strings and never converted to local time, so a due date cannot shift by a day between server, web and mobile.

### Enums (case-sensitive)

| Enum | Values |
|---|---|
| Project status | `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED` |
| Task status | `PENDING`, `IN_PROGRESS`, `COMPLETED` |
| Task priority | `LOW`, `MEDIUM`, `HIGH` |

Clients map these to friendly labels (`IN_PROGRESS` → "In Progress").

### Request body rules
- Unknown fields in a request body are **silently ignored (stripped)**.
- Clients can **never** set `id`, `userId`, `createdAt`, `updatedAt`, `projectName`, `taskCount` or `completedTaskCount`. These are ignored if sent.
- The authenticated user is always taken from the verified JWT, never from the request body.
- Empty strings for optional text fields are treated as "no value" (stored as `null`).

### Nullable fields
`description` is returned as `null` when empty. Sending `""` or `null` for `description` on update clears it.

### Success response format

Single object:

```json
{ "data": { } }
```

List (no pagination in this version; `total` equals the number of items returned):

```json
{ "data": { "items": [], "total": 0 } }
```

### Error response format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

`details` is optional. For `VALIDATION_ERROR` it is always:

```json
"details": { "fields": [ { "field": "name", "message": "Name is required" } ] }
```

(always an array, even for a single error).

### Error codes

| HTTP | Code | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid body, query parameter, path parameter (including malformed UUID), malformed JSON, or empty update body |
| 401 | `INVALID_CREDENTIALS` | Wrong email or password |
| 401 | `UNAUTHORIZED` | Missing, malformed or invalid token, or the user no longer exists |
| 401 | `TOKEN_EXPIRED` | JWT has expired |
| 404 | `NOT_FOUND` | Resource does not exist, belongs to another user, or the route does not exist |
| 409 | `CONFLICT` | Resource conflicts with existing data (e.g. email already registered) |
| 413 | `PAYLOAD_TOO_LARGE` | Request body exceeds the size limit |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server error (generic message only) |

All errors, including unknown routes (404) and malformed JSON (400), use the standard error format. The API never returns HTML error pages.

### Default sort order
- Projects: `createdAt` descending (newest first), ties by `id`.
- Tasks: `dueDate` ascending, then `createdAt` ascending.

### Search and filters
- `search` is a case-insensitive "contains" match on the name.
- Empty or whitespace-only filter values are treated as "no filter".
- Filters combine with AND.

---

## 3. Standard Objects

### User

| Field | Type |
|---|---|
| `id` | string (UUID) |
| `fullName` | string |
| `email` | string |

### Project

| Field | Type | Notes |
|---|---|---|
| `id` | string (UUID) | |
| `name` | string | |
| `description` | string or null | |
| `status` | enum | Project status |
| `startDate` | string | `YYYY-MM-DD` |
| `endDate` | string | `YYYY-MM-DD` |
| `taskCount` | number | Total tasks in the project (read-only) |
| `completedTaskCount` | number | Tasks with status `COMPLETED` (read-only) |
| `createdAt` | string | ISO 8601 |
| `updatedAt` | string | ISO 8601 |

```json
{
  "id": "uuid",
  "name": "Website Project",
  "description": "Build company website",
  "status": "IN_PROGRESS",
  "startDate": "2026-10-07",
  "endDate": "2026-11-07",
  "taskCount": 5,
  "completedTaskCount": 2,
  "createdAt": "2026-10-07T10:30:00.000Z",
  "updatedAt": "2026-10-07T10:30:00.000Z"
}
```

### Task

| Field | Type | Notes |
|---|---|---|
| `id` | string (UUID) | |
| `projectId` | string (UUID) | |
| `projectName` | string | Name of the parent project (read-only) |
| `name` | string | |
| `description` | string or null | |
| `priority` | enum | Task priority |
| `status` | enum | Task status |
| `dueDate` | string | `YYYY-MM-DD` |
| `createdAt` | string | ISO 8601 |
| `updatedAt` | string | ISO 8601 |

```json
{
  "id": "uuid",
  "projectId": "project-uuid",
  "projectName": "Website Project",
  "name": "Design homepage",
  "description": "Create homepage design",
  "priority": "HIGH",
  "status": "PENDING",
  "dueDate": "2026-10-15",
  "createdAt": "2026-10-07T10:30:00.000Z",
  "updatedAt": "2026-10-07T10:30:00.000Z"
}
```

---

## 4. Health

### GET /api/health
No authentication. Returns `200`:

```json
{ "data": { "status": "ok" } }
```

Used by the hosting platform and to wake a sleeping free-tier server before a demo.

---

## 5. Authentication

### POST /api/auth/register
Creates an account and logs the user in. No authentication.

Request:

```json
{ "fullName": "Diya Shrestha", "email": "diya@example.com", "password": "password123" }
```

Success `201 Created`:

```json
{
  "data": {
    "token": "JWT_TOKEN",
    "user": { "id": "uuid", "fullName": "Diya Shrestha", "email": "diya@example.com" }
  }
}
```

Errors: `400 VALIDATION_ERROR`, `409 CONFLICT` (email already registered), `429 RATE_LIMITED`.

### POST /api/auth/login
No authentication.

Request:

```json
{ "email": "diya@example.com", "password": "password123" }
```

Success `200 OK`: same shape as register.

Errors: `400 VALIDATION_ERROR`, `401 INVALID_CREDENTIALS`, `429 RATE_LIMITED`.

The `INVALID_CREDENTIALS` message is always `Invalid email or password.` It never reveals whether the email exists.

### POST /api/auth/logout
Requires authentication. No request body.

Success `200 OK`:

```json
{ "data": { "message": "Logged out successfully" } }
```

JWT authentication is stateless: the server does not invalidate the token. Clients **must delete their stored token and user state regardless of the logout response** (including if it fails or returns `401`).

### GET /api/auth/me
Requires authentication.

Success `200 OK`:

```json
{ "data": { "id": "uuid", "fullName": "Diya Shrestha", "email": "diya@example.com" } }
```

Errors: `401 UNAUTHORIZED`, `401 TOKEN_EXPIRED`.

---

## 6. Projects

All project endpoints require authentication and only ever act on the authenticated user's projects.

### GET /api/projects

| Query param | Type | Required | Notes |
|---|---|---|---|
| `search` | string | No | Project name contains (max 100 chars) |
| `status` | project status enum | No | |

Example: `GET /api/projects?search=website&status=IN_PROGRESS`

Success `200 OK`:

```json
{ "data": { "items": [ { "...standard Project object..." } ], "total": 1 } }
```

Errors: `400 VALIDATION_ERROR`, `401`.

### GET /api/projects/:id
Success `200 OK`: `{ "data": { standard Project object } }`

Errors: `400 VALIDATION_ERROR` (malformed UUID), `401`, `404 NOT_FOUND`.

### POST /api/projects
Request:

```json
{
  "name": "Website Project",
  "description": "Build company website",
  "status": "NOT_STARTED",
  "startDate": "2026-10-07",
  "endDate": "2026-11-07"
}
```

| Field | Type | Required |
|---|---|---|
| `name` | string | Yes |
| `description` | string | No |
| `status` | project status enum | Yes |
| `startDate` | date | Yes |
| `endDate` | date | Yes |

Success `201 Created`: `{ "data": { standard Project object } }` (with `taskCount: 0`, `completedTaskCount: 0`).

Errors: `400 VALIDATION_ERROR`, `401`.

### PUT /api/projects/:id
Partial update. All fields optional, but the body must contain at least one recognized field (otherwise `400 VALIDATION_ERROR`).

```json
{ "status": "IN_PROGRESS", "endDate": "2026-11-15" }
```

Success `200 OK`: `{ "data": { updated standard Project object } }`

Errors: `400 VALIDATION_ERROR`, `401`, `404 NOT_FOUND`.

### DELETE /api/projects/:id
Deletes the project. All of its tasks are deleted by database cascade.

Success `200 OK`:

```json
{ "data": { "message": "Project deleted successfully" } }
```

Errors: `400 VALIDATION_ERROR`, `401`, `404 NOT_FOUND`.

---

## 7. Tasks

All task endpoints require authentication. A task belongs to the user through its project: `Task → Project → User`.

### GET /api/tasks

| Query param | Type | Required | Notes |
|---|---|---|---|
| `projectId` | UUID | No | Must be one of the user's projects, else `404 NOT_FOUND` |
| `search` | string | No | Task name contains (max 100 chars) |
| `status` | task status enum | No | |
| `priority` | task priority enum | No | |

Example: `GET /api/tasks?projectId=<uuid>&status=PENDING&priority=HIGH`

Success `200 OK`:

```json
{ "data": { "items": [ { "...standard Task object..." } ], "total": 1 } }
```

Errors: `400 VALIDATION_ERROR`, `401`, `404 NOT_FOUND` (projectId not owned by the user).

### GET /api/tasks/:id
Success `200 OK`: `{ "data": { standard Task object } }`

Errors: `400 VALIDATION_ERROR`, `401`, `404 NOT_FOUND`.

### POST /api/tasks
Request:

```json
{
  "projectId": "project-uuid",
  "name": "Design homepage",
  "description": "Create homepage design",
  "priority": "HIGH",
  "status": "PENDING",
  "dueDate": "2026-10-15"
}
```

| Field | Type | Required |
|---|---|---|
| `projectId` | UUID | Yes |
| `name` | string | Yes |
| `description` | string | No |
| `priority` | task priority enum | Yes |
| `status` | task status enum | Yes |
| `dueDate` | date | Yes |

The backend must verify that `projectId` belongs to the authenticated user before creating the task. If it does not, return `404 NOT_FOUND` and create nothing.

Success `201 Created`: `{ "data": { standard Task object } }`

Errors: `400 VALIDATION_ERROR`, `401`, `404 NOT_FOUND`.

### PUT /api/tasks/:id
Partial update. All fields optional, but the body must contain at least one recognized field. `projectId` cannot be changed (tasks cannot be moved between projects in this version; a `projectId` in the body is ignored).

Marking a task complete:

```json
{ "status": "COMPLETED" }
```

Success `200 OK`: `{ "data": { updated standard Task object } }`

Errors: `400 VALIDATION_ERROR`, `401`, `404 NOT_FOUND`.

### DELETE /api/tasks/:id
Success `200 OK`:

```json
{ "data": { "message": "Task deleted successfully" } }
```

Errors: `400 VALIDATION_ERROR`, `401`, `404 NOT_FOUND`.

---

## 8. Dashboard

### GET /api/dashboard
Requires authentication. Returns statistics for the authenticated user only.

Success `200 OK`:

```json
{
  "data": {
    "totalProjects": 5,
    "totalTasks": 23,
    "completedTasks": 10,
    "pendingTasks": 8,
    "projectsInProgress": 2
  }
}
```

| Field | Definition |
|---|---|
| `totalProjects` | Projects owned by the user |
| `totalTasks` | Tasks in projects owned by the user |
| `completedTasks` | Tasks with status `COMPLETED` |
| `pendingTasks` | Tasks with status `PENDING` only. `IN_PROGRESS` tasks are **not** counted as pending |
| `projectsInProgress` | Projects with status `IN_PROGRESS` |

All values are `0` for a user with no data.

---

## 9. Authorization and Ownership

- Every project and task operation is scoped to the authenticated user.
- Tasks have no `userId`. Ownership is determined through `Task → Project → User`.
- A user can never read, update or delete another user's project or task by supplying its ID.
- Resources owned by another user return `404 NOT_FOUND`, never `403`, so their existence is not revealed.

---

## 10. Token Expiration

When the JWT is expired the backend returns `401`:

```json
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Your session has expired. Please log in again."
  }
}
```

Web and mobile clients must:
1. Clear the stored token.
2. Clear authenticated user state.
3. Redirect to the login screen.
4. Display: `Your session has expired. Please log in again.`
5. Not retry the request with the expired token.

---

## 11. Rate Limiting

Exceeding a limit returns `429`:

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again later."
  }
}
```

Limits are defined in `docs/SECURITY.md`. Clients show this message as-is.

---

## 12. API Design Rules

1. Do not change endpoint names, request or response field names, enum values or query parameters without updating this document first.
2. If a frontend need cannot be met by the current API, update this document, then the backend, then the clients.
3. The backend must follow this contract. Web and mobile must follow this contract.
4. Do not silently introduce undocumented API behavior.
5. The backend is authoritative for authentication, authorization, validation and ownership checks.