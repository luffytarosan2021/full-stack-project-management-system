# AGENTS.md: Project Management System (shared rules for all AI coding tools)

Monorepo with three apps that share one backend and one MySQL database:

```text
backend/   Node.js + Express REST API + Prisma + MySQL
web/       React (Vite) web app
mobile/    React Native (Expo) Android app
docs/      API.md, VALIDATION.md, SECURITY.md, DESIGN.md
```

## Source of truth (read before coding)
- `docs/API.md`: endpoints, field names, enums, error format. **Follow exactly.**
- `docs/VALIDATION.md`: validation rules for every field.
- `docs/SECURITY.md`: security rules. Security takes priority over convenience.
- `docs/DESIGN.md`: colors, components, screens, exact UI messages (frontends).
- `backend/prisma/schema.prisma`: database schema.

If something needed is missing from these documents, **stop and ask**. Do not invent endpoints, fields, enum values, or behavior. Do not change a document silently.

## Fixed tech stack (do not add or swap libraries without asking)

**Backend:** Node.js 22.18+, JavaScript with ES modules, Express 5, Prisma 7.10.0, `@prisma/adapter-mariadb`, `mariadb`, MySQL 8, `bcryptjs`, `jsonwebtoken`, `zod`, `helmet`, `cors`, `express-rate-limit`, `morgan`, `dotenv`. Tests: `vitest` + `supertest`.

**Web:** React + Vite, React Router, TanStack Query, Axios, React Hook Form + Zod, Tailwind CSS + shadcn/ui, `lucide-react`.

**Mobile:** Expo (managed), Expo Router, TanStack Query, Axios, React Hook Form + Zod, `react-native-paper` (custom theme from `DESIGN.md`), `expo-secure-store`, `@react-native-community/netinfo`, `@react-native-community/datetimepicker`, `@expo-google-fonts/inter`, `lucide-react-native` or `@expo/vector-icons`.

## Backend structure

```text
backend/src/
  app.js            Express app (middleware + routes), exported for tests
  server.js         Starts the server
  config/           env validation, prisma client, cors options
  middleware/       auth, rateLimiters, validate, errorHandler, notFound
  routes/           authRoutes, projectRoutes, taskRoutes, dashboardRoutes, healthRoutes
  controllers/      thin: parse request, call service, send response
  services/         business logic and Prisma queries (ownership checks live here)
  validators/       Zod schemas
  utils/            AppError, response helpers, date helpers, serializers
backend/prisma/     schema.prisma, migrations/, seed.js
backend/tests/      integration tests
```

## Coding rules (all apps)
- camelCase JSON everywhere in the API. Dates are plain `YYYY-MM-DD` strings; never convert through local timezones.
- Web date inputs use the native `<input type="date">` or the shadcn date picker.
- Mobile date inputs use `@react-native-community/datetimepicker`.
- Display dates with `Intl.DateTimeFormat`; do not add a date library.
- Small focused files and functions. No dead code, no unused dependencies, no `console.log` left in committed code (use the logger).
- No secrets in code or in Git. Use `.env` (ignored) and commit `.env.example`.
- Work **one phase at a time**. Do only what the current prompt asks. Do not refactor unrelated files.
- After finishing a task, list exactly how to test it manually.

## Backend hard rules
- Never pass `req.body` to Prisma directly. Parse with Zod, then use the parsed result.
- User ID comes only from the verified JWT.
- Every project and task query filters by ownership inside the database query. Other users' data returns `404 NOT_FOUND`.
- Never return `passwordHash`. Use Prisma `select`.
- Every Prisma update must explicitly set `updated_at: new Date()` (no `@updatedAt` in the schema; see the header of `docs/schema.prisma`).
- Never use `$queryRawUnsafe`, `$executeRawUnsafe`, or string-built SQL.
- All errors go through the central error handler in the format from `API.md`. Never leak stack traces or Prisma messages.

## Frontend hard rules
- Use the API exactly as in `docs/API.md`. One API client module per app. All requests go through it.
- Use only the colors, badges, components and messages from `docs/DESIGN.md`.
- Every screen needs loading, empty and error states.
- Validate forms with the limits from `docs/VALIDATION.md`. Map server `details.fields` errors to form fields.
- On `401 TOKEN_EXPIRED`: clear stored token and user state, redirect to login, show the session-expired message.
- Mobile token only in `expo-secure-store`. Never AsyncStorage.
- Web token as Bearer token in `localStorage` (documented decision). Never use `dangerouslySetInnerHTML`.
- API base URL only from env (`VITE_API_URL`, `EXPO_PUBLIC_API_URL`).
- Use Inter as the application font according to `docs/DESIGN.md`.