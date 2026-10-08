# Project Management System: Validation Rules

These rules are shared by the backend, web app and mobile app.

- The **backend is authoritative**. It validates every request, whichever client sent it.
- Web and mobile reuse the same rules for instant feedback, but frontend validation never replaces backend validation.
- The backend uses **Zod** for validation.

Related documents: `docs/API.md`, `docs/SECURITY.md`, `backend/prisma/schema.prisma`.

---

## 1. General Rules

1. String values are **trimmed** before validation, except `password` (see below).
2. Required strings must not be empty or whitespace-only after trimming.
3. Enum values must match `docs/API.md` exactly (case-sensitive).
4. Dates must be `YYYY-MM-DD` and a **real calendar date** (see section 6).
5. Date fields never contain timestamps.
6. Emails are trimmed and lowercased by the backend.
7. Unknown body fields are **stripped** (ignored), not rejected. `id`, `userId`, `createdAt`, `updatedAt`, `projectName`, `taskCount` and `completedTaskCount` are never accepted from clients.
8. Optional text fields: an empty or whitespace-only value is stored as `null`.
9. Path parameter `:id` and any `projectId` must be a valid UUID. A malformed value returns `400 VALIDATION_ERROR` (not 404, not 500).
10. A malformed JSON body returns `400 VALIDATION_ERROR`.
11. Request bodies larger than 10 KB return `413 PAYLOAD_TOO_LARGE`.
12. Past dates are allowed for all date fields. There is no "must be in the future" rule.
13. Repeated or array-valued query parameters (e.g. `?status=A&status=B`) return `400 VALIDATION_ERROR`.

---

## 2. User Fields

### fullName
| Rule | Value |
|---|---|
| Required | Yes |
| Type | string, trimmed |
| Length | 1 to 100 characters |

### email
| Rule | Value |
|---|---|
| Required | Yes |
| Type | string, trimmed, lowercased |
| Length | max 255 characters |
| Format | valid email address |
| Uniqueness | unique (database unique constraint) |

`Diya@Example.com` and `diya@example.com` are the same account.

### password
| Rule | Value |
|---|---|
| Required | Yes |
| Type | string, **never trimmed or altered** |
| Length | 8 to 72 **bytes** (`Buffer.byteLength(password, "utf8")`), because bcrypt ignores anything beyond 72 bytes |
| Storage | bcrypt hash only |

On login, `email` and `password` only need to be present and well-formed. Do not apply the register length rules to login in a way that leaks information.

---

## 3. Project Fields

### name
Required on create. String, trimmed, 1 to 150 characters.

### description
Optional. String, trimmed, max 2000 characters. Empty becomes `null`.

### status
Required on create, optional on update. One of `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`.

### startDate
Required on create, optional on update. Valid `YYYY-MM-DD` date.

### endDate
Required on create, optional on update. Valid `YYYY-MM-DD` date. Must be on or after `startDate`.

---

## 4. Task Fields

### projectId
Required on create only. Valid UUID. The project must belong to the authenticated user (otherwise `404 NOT_FOUND`). Ignored on update.

### name
Required on create. String, trimmed, 1 to 150 characters.

### description
Optional. String, trimmed, max 2000 characters. Empty becomes `null`.

### priority
Required on create, optional on update. One of `LOW`, `MEDIUM`, `HIGH`.

### status
Required on create, optional on update. One of `PENDING`, `IN_PROGRESS`, `COMPLETED`.

### dueDate
Required on create, optional on update. Valid `YYYY-MM-DD` date.

---

## 5. Query Parameters

| Endpoint | Parameter | Rule |
|---|---|---|
| `GET /api/projects` | `search` | Optional string, trimmed, max 100 chars; empty means no filter |
| `GET /api/projects` | `status` | Optional project status enum |
| `GET /api/tasks` | `projectId` | Optional UUID; must belong to the user (else `404 NOT_FOUND`) |
| `GET /api/tasks` | `search` | Optional string, trimmed, max 100 chars; empty means no filter |
| `GET /api/tasks` | `status` | Optional task status enum |
| `GET /api/tasks` | `priority` | Optional task priority enum |

An empty value (`?status=`) is treated as no filter. A non-empty invalid value returns `400 VALIDATION_ERROR`.

---

## 6. Date Validation

A format check alone is not enough, because JavaScript silently rolls invalid dates over (`2026-02-30` becomes March 2). The backend must:

1. Match the pattern `^\d{4}-\d{2}-\d{2}$`.
2. Parse the value as a UTC date.
3. Confirm the parsed date, formatted back to `YYYY-MM-DD`, equals the original input.

Reference helper:

```ts
const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .refine((v) => {
    const d = new Date(`${v}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
  }, "Invalid calendar date");
```

Date-only values are stored in MySQL `DATE` columns and returned as plain `YYYY-MM-DD` strings. They are never converted using the server's or client's local timezone.

---

## 7. Update (PUT) Rules

Updates are partial: every field is optional.

- A body with **no recognized fields** (e.g. `{}`) returns `400 VALIDATION_ERROR`.
- Supplying only `{ "status": "COMPLETED" }` is valid and changes only the status.
- **Project dates:** the backend must validate the resulting state. If only one of `startDate` or `endDate` is supplied, validate it against the project's existing value for the other. `endDate < startDate` is rejected.
- `description: ""` or `null` clears the description.
- `projectId` on a task update is ignored.

---

## 8. Validation Error Response

HTTP `400`. `details.fields` is **always an array**, even for one error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": {
      "fields": [
        { "field": "name", "message": "Name is required" },
        { "field": "endDate", "message": "End date must be on or after start date" }
      ]
    }
  }
}
```

For path or query errors, `field` is the parameter name (e.g. `id`, `status`).

Messages must be human-readable and must never echo passwords or internal details.

---

## 9. Frontend Behavior

- Validate forms before submitting and show the error next to the field.
- Use the same limits as this document (e.g. name max 150, description max 2000, password 8 to 72).
- Map backend `details.fields` entries back onto form fields when the server rejects a request.
- Never assume frontend validation is sufficient.

---

## 10. Source of Truth

This document must stay consistent with `docs/API.md`, `docs/SECURITY.md` and `backend/prisma/schema.prisma`. When a rule changes:

1. Update this document.
2. Update backend validation.
3. Update web validation.
4. Update mobile validation.
5. Test the affected behavior.

Never change a validation rule in only one application.