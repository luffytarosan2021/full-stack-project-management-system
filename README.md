# Project Management System

A full-stack project and task manager. Users register, create projects, add tasks with a priority, status and due date, and track progress on a dashboard. The same account works on the web app and the Android app, and both stay in sync through one REST API.

## Live links

| | URL |
|---|---|
| Web app | `<add the Vercel URL after deployment>` |
| Backend API | `<add the Render URL after deployment>/api` |
| Android APK | `<add the EAS build link after the build>` |

The backend runs on Render's free tier, which sleeps after 15 minutes without traffic. The first request after that can take up to about a minute while it wakes up. Open `<backend URL>/api/health` once before using the apps (it returns `{"data":{"status":"ok"}}` when ready).

### Test credentials

| Email | Password |
|---|---|
| `<add after creating the demo account>` | `<add after creating the demo account>` |

This is a demo account that holds sample data only. You can also register a new account from the web app or the APK.

## Architecture

| Part | Technology | Folder |
|---|---|---|
| Web app | React 19, Vite, React Router, TanStack Query, Tailwind CSS, shadcn/ui | `web/` |
| Mobile app | React Native with Expo (managed workflow), Expo Router, TanStack Query, `expo-secure-store` (Android) | `mobile/` |
| Backend API | Node.js, Express 5, Zod validation, JWT authentication, bcrypt | `backend/` |
| Database | MySQL 8 | |
| ORM | Prisma 7 with the MariaDB driver adapter | `backend/prisma/` |

```
Web app (browser) ─┐
                   ├── HTTPS, JSON, Bearer JWT ──> Express API ── Prisma ──> MySQL
Android app ───────┘
```

The backend is the only part that talks to the database. It is the authority for authentication, validation and ownership: every project and task query is scoped to the logged-in user.

## Repository structure

```
backend/          Express API
  prisma/         Prisma schema (MySQL)
  src/            config, routes, controllers, services, validators, middleware
  tests/          Vitest + Supertest API tests
web/              React (Vite) web app
mobile/           Expo Android app
docs/             API contract, validation rules, security rules, design, schema and ER diagram
render.yaml       Render deployment blueprint for the backend
```

## Prerequisites

- Node.js 22.18 or newer (developed on Node 24) and npm
- MySQL 8 (local development)
- For the mobile app: the Expo Go app on an Android phone, or an Android emulator
- For building the APK: a free Expo account and `eas-cli`

## Local setup

### Database

Create the database and tables from the SQL schema, then a dedicated user for the app (do not use `root` in the app):

```bash
mysql -u root -p < docs/schema.sql
```

```sql
CREATE USER '<app-user>'@'localhost' IDENTIFIED BY '<strong-password>';
GRANT SELECT, INSERT, UPDATE, DELETE ON project_management.* TO '<app-user>'@'localhost';
```

`docs/schema.sql` and `backend/prisma/schema.prisma` describe the same three tables. The project has no Prisma migrations folder; the SQL file is the way to create the schema.

### Backend

```bash
cd backend
cp .env.example .env      # fill in the values (see Environment variables)
npm install
npm run build             # generates the Prisma client
npm run db:check          # confirms the database connection
npm run dev               # http://localhost:4000
npm test                  # API tests
```

### Web

```bash
cd web
cp .env.example .env      # VITE_API_URL=http://localhost:4000/api
npm install
npm run dev               # http://localhost:5173
```

`http://localhost:5173` must be in the backend's `CLIENT_ORIGIN`.

### Mobile

```bash
cd mobile
cp .env.example .env      # set EXPO_PUBLIC_API_URL (see below)
npm install
npx expo start            # scan the QR code with Expo Go, or press "a" for an emulator
```

| Where the app runs | `EXPO_PUBLIC_API_URL` |
|---|---|
| Android emulator | `http://10.0.2.2:4000/api` |
| Physical phone (development) | `http://<your Mac's LAN IP>:4000/api` |
| Release APK | `https://<deployed backend>/api` |

On a physical phone, use your Mac's LAN IP (`ipconfig getifaddr en0`). The phone and Mac must be on the same Wi-Fi network, and the Mac firewall must allow incoming connections to Node on port 4000. The release APK always uses the deployed HTTPS backend; it is never built against a local address. See `mobile/README.md` for details.

## Environment variables

Each app has a `.env.example` with placeholders. Real `.env` files are ignored by Git and must never be committed.

**Backend (`backend/.env`)**

```
NODE_ENV=development
PORT=4000
DATABASE_URL=<your-database-url>
JWT_SECRET=<your-secret>
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=<your-web-url>
```

| Variable | Notes |
|---|---|
| `DATABASE_URL` | `mysql://<user>:<password>@<host>:<port>/<database>`. Locally add `?allowPublicKeyRetrieval=true`; in production use `?ssl=true` |
| `JWT_SECRET` | At least 32 random characters: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. Use a different secret in production |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CLIENT_ORIGIN` | Comma-separated exact web origins allowed by CORS (never `*`) |
| `NODE_EXTRA_CA_CERTS` | Production only: path to the database provider's CA certificate, so the TLS certificate is verified |

The backend validates these at startup and refuses to start if any is missing or invalid.

**Web (`web/.env`)**

```
VITE_API_URL=<your-backend-api-url>
```

**Mobile (`mobile/.env`)**

```
EXPO_PUBLIC_API_URL=<your-backend-api-url>
```

`VITE_*` and `EXPO_PUBLIC_*` values are embedded in the client bundles, so they hold only the public API URL, never secrets.

## API overview

All endpoints are under `/api`. Full request and response details are in [`docs/API.md`](docs/API.md).

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Create an account |
| POST | `/api/auth/login` | No | Log in |
| POST | `/api/auth/logout` | Yes | Log out |
| GET | `/api/auth/me` | Yes | Current user |
| GET, POST | `/api/projects` | Yes | List (with `search`, `status`) / create projects |
| GET, PUT, DELETE | `/api/projects/:id` | Yes | Read / update / delete a project (deleting removes its tasks) |
| GET, POST | `/api/tasks` | Yes | List (with `projectId`, `search`, `status`, `priority`) / create tasks |
| GET, PUT, DELETE | `/api/tasks/:id` | Yes | Read / update / delete a task |
| GET | `/api/dashboard` | Yes | Totals for projects, tasks, completed, pending and in-progress projects |

Responses use `{ "data": ... }` on success and `{ "error": { "code", "message", "details" } }` on failure. Dates are `YYYY-MM-DD` strings. Another user's project or task returns `404`, never its data.

## Authentication

- Passwords are hashed with bcrypt (cost 12) and never returned or logged.
- Login and registration return a JWT (HS256, 7-day expiry). Protected requests send `Authorization: Bearer <token>`.
- The web app stores the token in `localStorage`. This is a deliberate trade-off for a single-page app calling a separate API: the app renders all user content as plain text (no `dangerouslySetInnerHTML`) and the Vercel config sets a Content-Security-Policy.
- The Android app stores the token only in `expo-secure-store` (Android Keystore).
- When a token expires, both clients clear it, return to the login screen and show "Your session has expired. Please log in again."

Other protections: Helmet security headers, CORS limited to the web origin, rate limiting (login, registration and overall API), a 10 KB request body limit, Zod validation of every input, and database queries scoped to the logged-in user. See [`docs/SECURITY.md`](docs/SECURITY.md).

### Known limitations

- Logout is client-side: a JWT stays valid until it expires (no token blocklist or refresh tokens).
- The web token is in `localStorage` (see above).
- Rate limits are kept in memory per server instance and reset when the server restarts.
- Registration reports when an email is already registered, which reveals that the account exists.
- On the free hosting tier, the first request after the backend sleeps can take up to a minute; a client request can time out once while it wakes.

## Database

Three tables: `users`, `projects` and `tasks`. A user owns many projects and a project contains many tasks; deleting a user or project cascades to its children. See [`docs/ER-DIAGRAM.md`](docs/ER-DIAGRAM.md), [`docs/er-diagram.png`](docs/er-diagram.png) and [`docs/schema.sql`](docs/schema.sql).

## Deployment

Deployment steps (Aiven MySQL, Render backend, Vercel web, EAS APK), the demo recording plan and the submission checklist are in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).
