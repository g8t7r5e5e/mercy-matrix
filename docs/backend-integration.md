# Backend Integration Audit and Plan

This project is a Lovable-exported WelfareOS / Mercy Matrix frontend. Phase 1 keeps the existing UI intact and only prepares the codebase for Supabase-backed data.

## Current stack

- Framework: React 19 with TanStack Start, TanStack Router, TanStack Query, Vite, and Tailwind CSS 4.
- Routing: TanStack file-based routes in `src/routes`, generated into `src/routeTree.gen.ts`.
- UI: shadcn/Radix-style components under `src/components/ui`, plus app layout components under `src/components/layout`.
- Charts and icons: Recharts and Lucide React.

## Current auth and state

- `src/lib/store.tsx` is the app-wide client store and context provider.
- Login is demo-only: `login(email, password)` checks `ACCOUNTS` from `src/lib/mock-data.ts`.
- Session and mutable project state are persisted in browser `localStorage` under `welfareos.session.v1` and `welfareos.state.v1`.
- The `/app` layout redirects unauthenticated users to `/login` based on the local store user.

## Mock data sources to replace gradually

| Area | Current source | Used by |
| --- | --- | --- |
| Demo users and roles | `ACCOUNTS` in `src/lib/mock-data.ts` | `src/lib/store.tsx`, `src/routes/app.users.tsx`, `src/routes/login.tsx` quick-login UX |
| Projects, timelines, donations, messages, documents | `SEED_PROJECTS` in `src/lib/mock-data.ts` | `src/lib/store.tsx`, dashboard/project routes through `useStore()` |
| Blood donors | `BLOOD_DONORS` in `src/lib/mock-data.ts` | `src/routes/app.blood.tsx`, `src/routes/app.blood-donors.tsx` |
| Donors | `DONORS` in `src/lib/mock-data.ts` | `src/routes/app.donors.tsx` |
| Volunteers | `VOLUNTEERS` in `src/lib/mock-data.ts` | `src/routes/app.volunteers.tsx` |
| Wings | `WINGS` in `src/lib/mock-data.ts` | `src/routes/app.submit.tsx`, `src/routes/app.projects.tsx`, `src/routes/app.settings.tsx` |
| Dashboard charts | Local route constants | `src/routes/app.index.tsx`, `src/routes/app.analytics.tsx` |
| Messages | Local route constants | `src/routes/app.messages.tsx` |
| Tasks | Local route constants | `src/routes/app.tasks.tsx` |
| Reports | Local route constants | `src/routes/app.reports.tsx` |

## Main pages and components

- Shell and providers: `src/routes/__root.tsx`.
- Auth entry point: `src/routes/login.tsx`.
- Protected app shell: `src/routes/app.tsx` with `Sidebar` and `Topbar`.
- Dashboard: `src/routes/app.index.tsx`.
- Projects: `src/routes/app.projects.tsx`, `src/routes/app.projects.$id.tsx`, `src/routes/app.submit.tsx`.
- Welfare operations: blood requests, blood donors, donors, finance, volunteers, tasks, messages, users, audit logs, reports, analytics, and settings under `src/routes/app.*.tsx`.
- Shared project/status badges: `src/components/Badges.tsx`.

## What should change first for backend integration

1. Add Supabase frontend configuration without real secrets.
2. Add a single Supabase browser client module that is safe to import during TanStack Start SSR.
3. Keep `src/lib/store.tsx` as a compatibility layer initially so existing pages and animations do not break.
4. Replace demo login with Supabase Auth in a later phase while preserving the current login page design.
5. Introduce database types and typed repository/query functions around projects before changing page components.
6. Move each mock data area behind feature-specific data access functions, then migrate routes one at a time.
7. Add Supabase Storage document upload paths and Realtime project chat only after projects/auth are live.

## Implementation plan

### Phase 1 — environment and integration prep

- Add `.env.example` with required public Supabase variables.
- Add `src/lib/supabase.ts` as the single app Supabase client entry point.
- Add `@supabase/supabase-js` as a project dependency.
- Document current mock data and state boundaries in this audit file.

### Phase 2 — auth foundation

- Create role/profile types aligned with `super_admin`, `wing_head`, `member`, `volunteer`, `general_user`, `donor`, and `blood_donor`.
- Replace demo credential checks with Supabase Auth.
- Load user profile/role after auth and preserve route guards.
- Keep demo seed data fallback only behind an explicit development flag if needed.

### Phase 3 — projects data model and reads

- Add Supabase schema/migrations for projects, assignments, timelines, documents, donations, expenses, chats, notifications, and audit logs.
- Generate or maintain typed database definitions.
- Replace project reads with Supabase queries while preserving current page components.

### Phase 4 — project writes and documents

- Wire project submission, status changes, donations, chat messages, and document uploads to Supabase.
- Add Storage buckets and file metadata rows.
- Add audit log writes for sensitive actions.

### Phase 5 — realtime and role-aware UX

- Add Realtime subscriptions for project chat, notifications, and project updates.
- Enforce role-scoped views in UI and Row Level Security.
- Add dashboard analytics from real aggregated data.

### Phase 6 — donor communications and production hardening

- Add Resend or SendGrid server-side email workflows.
- Add error monitoring, loading/error states, and deployment documentation for Vercel/Netlify.
