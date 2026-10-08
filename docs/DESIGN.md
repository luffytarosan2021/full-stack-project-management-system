# Project Management System: Design Spec

Shared by the web app and the mobile app so both feel like one product.

Related: `docs/API.md` (data and messages), `docs/VALIDATION.md` (form limits).

---

## 1. Design Principles
- Clean, calm, lots of whitespace. One primary color, status colors only for meaning.
- Every screen has **loading, empty, error** states. Never a blank screen.
- Text labels always accompany colors (badges say "High", not just a red dot).
- Touch targets at least 44px high on mobile.

---

## 2. Design Tokens

### Colors

| Token | Hex | Use |
|---|---|---|
| `primary` | `#4F46E5` | Buttons, links, active nav, focus rings |
| `primary-hover` | `#4338CA` | Hover and pressed |
| `primary-soft` | `#EEF2FF` | Selected rows, soft backgrounds |
| `bg` | `#F8FAFC` | Page background |
| `surface` | `#FFFFFF` | Cards, inputs, modals |
| `border` | `#E2E8F0` | Card and input borders |
| `text` | `#0F172A` | Main text |
| `text-muted` | `#64748B` | Secondary text, placeholders |
| `danger` | `#DC2626` | Errors, delete actions |
| `danger-soft` | `#FEF2F2` | Error banners |
| `success` | `#16A34A` | Success toasts |

### Project status badges

| Status | Label | Text | Background |
|---|---|---|---|
| `NOT_STARTED` | Not Started | `#475569` | `#F1F5F9` |
| `IN_PROGRESS` | In Progress | `#1D4ED8` | `#DBEAFE` |
| `COMPLETED` | Completed | `#15803D` | `#DCFCE7` |

### Task status badges

| Status | Label | Text | Background |
|---|---|---|---|
| `PENDING` | Pending | `#475569` | `#F1F5F9` |
| `IN_PROGRESS` | In Progress | `#1D4ED8` | `#DBEAFE` |
| `COMPLETED` | Completed | `#15803D` | `#DCFCE7` |

### Priority badges

| Priority | Label | Text | Background |
|---|---|---|---|
| `LOW` | Low | `#475569` | `#F1F5F9` |
| `MEDIUM` | Medium | `#B45309` | `#FEF3C7` |
| `HIGH` | High | `#B91C1C` | `#FEE2E2` |

### Typography
- Font: **Inter** (web via Google Fonts; mobile via `@expo-google-fonts/inter`), with system font fallback.
- Sizes: page title 24 (semibold), section title 18 (semibold), body 14 to 16, caption 12.

### Shape and spacing
- Border radius: 8 for inputs and buttons, 12 for cards and modals, 999 for badges.
- Spacing scale: 4, 8, 12, 16, 24, 32.
- Cards: white surface, 1px `border`, very light shadow.

---

## 3. Date and Text Display
- Send and receive API dates as plain `YYYY-MM-DD` strings only.
- Never convert API dates through local timezones.
- Display user-facing dates as `07 Oct 2026` using `Intl.DateTimeFormat`.
- Display created dates wherever project/task metadata is shown using the same `07 Oct 2026` format, labeled as `Created`.
- A task is **overdue** when `dueDate` is before today and status is not `COMPLETED`. Show the due date in `danger` color with the text "Overdue".
- Truncate long names with an ellipsis in lists. Show full text in details.

### Date inputs
- Web: use the native `<input type="date">` or the shadcn date picker.
- Mobile: use `@react-native-community/datetimepicker`.
- Do not add another date library.

---

## 4. Reusable Components (build these first)

| Component | Purpose |
|---|---|
| `StatusBadge` | Project or task status pill (colors above) |
| `PriorityBadge` | Task priority pill |
| `StatCard` | Dashboard number with label and icon |
| `ProjectCard` | Name, status badge, date range, progress bar (`completedTaskCount / taskCount`) |
| `TaskItem` | Checkbox (mark complete), name, priority badge, status badge, due date, overflow actions |
| `SearchInput` | Debounced (300 ms) search field with clear button |
| `FilterSelect` | Dropdown or chips for status and priority, including an "All" option |
| `EmptyState` | Icon, title, message, optional action button |
| `ErrorState` | Message plus "Try again" button |
| `LoadingState` | Spinner or skeletons |
| `ConfirmDialog` | Used for every delete |
| `FormField` | Label, input, inline error text |
| `Toast` / snackbar | Success and error feedback |

---

## 5. Web Screens (React)

### Layout
- **Public pages** (`/login`, `/register`): centered card, app name above.
- **App shell** (logged in): top bar (app name, user's name, Logout) and a sidebar on desktop with links Dashboard and Projects. On small screens the sidebar becomes a hamburger menu.
- Unauthenticated users are redirected to `/login`. Logged-in users visiting `/login` go to `/dashboard`.

### Routes

| Route | Screen |
|---|---|
| `/login` | Login form |
| `/register` | Register form |
| `/dashboard` | Five stat cards |
| `/projects` | Search, status filter, "New Project" button, grid of `ProjectCard` |
| `/projects/:id` | Project header (name, status, dates, description, Edit and Delete), task toolbar (search, status filter, priority filter, "Add Task"), list of `TaskItem` |
| `*` | Not found page with a link back to the dashboard |

Project create and edit use a modal form. Task create and edit use a modal form.

### Dashboard cards (in this order)
Total Projects, Total Tasks, Completed Tasks, Pending Tasks, Projects In Progress.

---

## 6. Mobile Screens (Expo / React Native)

### Navigation
- **Auth stack:** Login, Register.
- **Main tabs (bottom):** Dashboard, Projects, Profile.
- **Stack screens on top of tabs:** Project Details (tasks list), Task Form (create or edit).

### Screens

| Screen | Content |
|---|---|
| Login, Register | Form fields, validation errors under fields, link to the other screen |
| Dashboard | Five `StatCard`s, pull-to-refresh |
| Projects | Read-only list of `ProjectCard` (name, status, progress), search by name, status filter, pull-to-refresh. Tapping opens Project Details |
| Project Details | Project summary (read-only), task search, status and priority filters, list of `TaskItem`, floating "+" button, pull-to-refresh |
| Task Form | Name, description, priority, status, due date picker, project (fixed when opened from a project), Save, and Delete when editing |
| Profile | Name, email, Logout button |

Mobile does not create, edit or delete projects (web only). Mobile can create, edit, delete and complete tasks, and change task status and priority.

Quick actions on a task row: tapping the checkbox marks it `COMPLETED` (and un-checking returns it to `PENDING`). Long-press or a menu offers Edit, Change status, Change priority, Delete.

---

## 7. Exact Messages

| Situation | Message |
|---|---|
| Session expired | `Your session has expired. Please log in again.` |
| No network | `No internet connection. Please check your connection and try again.` |
| Generic server error | `Something went wrong. Please try again.` |
| Rate limited | `Too many requests. Please try again later.` |
| Wrong login | `Invalid email or password.` |
| Email taken | `An account with this email already exists.` |
| Logged out | `You have been logged out.` |
| Project deleted | `Project deleted.` |
| Task deleted | `Task deleted.` |
| Project saved | `Project saved.` |
| Task saved | `Task saved.` |

### Confirm dialogs
- Delete project: title `Delete this project?`, body `This will also delete all of its tasks. This cannot be undone.`, buttons `Cancel`, `Delete`.
- Delete task: title `Delete this task?`, body `This cannot be undone.`, buttons `Cancel`, `Delete`.

### Empty states

| Screen | Title | Message | Action |
|---|---|---|---|
| Projects (none) | No projects yet | Create your first project to get started. | New Project (web) |
| Projects (no match) | No projects found | Try a different search or filter. | Clear filters |
| Tasks (none) | No tasks yet | Add a task to this project. | Add Task |
| Tasks (no match) | No tasks found | Try a different search or filter. | Clear filters |

### Form errors
Show validation text directly under the field. Use the messages from the server's `details.fields` when the backend rejects a request, and map them to the matching field.

---

## 8. Behavior Rules
- Buttons that submit show a loading state and are disabled while the request runs (prevents double submit).
- Search inputs are debounced (300 ms). Filters apply immediately.
- After create, edit or delete, refresh the affected list (TanStack Query invalidation).
- Dashboard data refreshes on screen focus and on pull-to-refresh (mobile) or page load (web).
- On `TOKEN_EXPIRED`: clear storage, go to login, show the session-expired message once.
- Mobile checks connectivity before and after failed requests and shows the no-network message instead of a blank list.

---

## 9. Responsive Targets (Web)
- Mobile (below 640px): single column, hamburger menu, full-width modals.
- Tablet (640 to 1024px): two-column project grid.
- Desktop (above 1024px): sidebar, three-column project grid, dashboard cards in one row.
