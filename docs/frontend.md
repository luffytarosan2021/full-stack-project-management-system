# Frontend rules (web and mobile)

Follow the repo-root `AGENTS.md` (shared rules and fixed tech stack), plus the points below.

Read before coding any UI, and follow exactly:
- `docs/API.md`: endpoints, field names, enums, error format
- `docs/VALIDATION.md`: form limits and messages
- `docs/DESIGN.md`: colors, badges, components, screens, exact UI messages
- `AGENTS.md`: libraries (do not add or swap libraries without asking)

Rules:
- Build one thing at a time as the prompt asks. Do not generate extra screens or features.
- Build and reuse the shared components from `docs/DESIGN.md` (StatusBadge, PriorityBadge, EmptyState, ErrorState, LoadingState, ConfirmDialog, FormField, and so on) before building screens.
- All requests go through a single API client module. It unwraps `{ data }`, reads `{ error: { code, message, details } }`, and handles `TOKEN_EXPIRED` and network failure in one place.
- Every screen must have loading, empty and error states with the exact messages from `DESIGN.md`.
- Validate forms with React Hook Form + Zod using the limits in `VALIDATION.md`. Show errors under the field. Map server `details.fields` to form fields.
- Use TanStack Query for server data. Invalidate the affected queries after create, edit and delete.
- Never call an endpoint, send a field, or use an enum value that is not in `API.md`. If something is missing, stop and ask.
- Do not store secrets in the app. API URL comes from env only.
- Web: responsive per `DESIGN.md`, token in `localStorage`, no `dangerouslySetInnerHTML`.
- Mobile: token only in `expo-secure-store`, pull-to-refresh on every list, no-network message, 44px minimum touch targets, no project create/edit/delete.
- When finished, list the screens and states to check manually.
