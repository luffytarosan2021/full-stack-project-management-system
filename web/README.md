# Web app

React (Vite) client for the Project Management System. It follows `docs/API.md`, `docs/VALIDATION.md`, `docs/SECURITY.md` and `docs/DESIGN.md`.

## Setup

```bash
cp .env.example .env   # set VITE_API_URL (backend base URL including /api)
npm install
npm run dev            # http://localhost:5173 (must be listed in the backend CLIENT_ORIGIN)
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build into `dist/` |
| `npm run lint` | Lint with oxlint |
| `npm run preview` | Serve the production build locally |

## Authentication

The JWT is stored in `localStorage` and sent as `Authorization: Bearer <token>` by the single API client (`src/lib/apiClient.js`). This is a documented trade-off (see `docs/SECURITY.md` section 14): the app never uses `dangerouslySetInnerHTML` and renders user content as plain text.
