# Backend Integration Notes

## Phase 3: Supabase schema files

Phase 3 adds the initial Supabase/PostgreSQL database schema files for WelfareOS / Mercy Matrix:

- `supabase/schema.sql` defines the platform tables, enum types, relationships, indexes, comments, `updated_at` trigger support, and starter Row Level Security policies.
- `supabase/seed.sql` adds safe starter wing data only.

The application still uses the existing demo/local authentication flow. The UI is still not connected to Supabase, and this phase does not migrate login, routes, dashboards, components, or mock data.

Next phase recommendation: run the schema manually in Supabase, review RLS behavior with real development users, and then migrate authentication carefully in a dedicated phase.

## Phase 4: Supabase Auth connection

Phase 4 connects the existing login flow to Supabase Auth when both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured.

- Login uses `supabase.auth.signInWithPassword` in configured environments.
- Logout uses `supabase.auth.signOut` in configured environments.
- Session restore uses the Supabase Auth session after page refresh.
- The app loads `public.profiles` by `auth.users.id` and combines `profiles.full_name` plus `profiles.role` with the authenticated user's email from the Supabase Auth session.
- The `public.profiles` table does not need an `email` column; UI email display comes from Supabase Auth.
- If Supabase environment variables are missing, the app logs a console warning and keeps the existing demo/local auth fallback working.
- Project, dashboard, donor, volunteer, and other app data still use local mock data in this phase.

Next phase recommendation: verify Supabase Auth and RLS with the manually created development users, then migrate project/dashboard data to Supabase in a separate careful phase.

## Phase 5: Projects and dashboard Supabase connection

Phase 5 connects the core project system and dashboard while preserving the existing Lovable UI and the Phase 4 Supabase Auth flow.

- When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured, the shared store fetches `public.projects` and maps rows into the existing project card/detail shape.
- Project companion data is loaded where RLS permits it: `project_updates` for timeline/activity, `donations` for funding entries, `project_messages` for project chat, `blood_requests` for blood-specific details, `wings` for wing labels, and `profiles` for assigned/submitting names.
- Missing Supabase environment variables keep the exact local/mock project fallback path active, including local persistence for demo project submissions.
- Project submission now inserts a real `public.projects` row in configured environments with `pending_review` status, `submitted_by`, requester/contact/location details, funding target, urgency, type, wing, and a generated `metadata.project_code` such as `WOS-108`.
- Blood request submissions also prepare a linked `public.blood_requests` record when blood group information is supplied.
- Status actions write back to `public.projects`, append a `project_updates` timeline note when allowed, and refresh all connected dashboard/project state.
- Dashboard KPI cards now derive project totals, active/completed/pending counts, funds raised, lives impacted, urgent cases, and blood counts from the current project state.
- Supabase Realtime subscriptions listen to `projects`, `project_updates`, and `notifications`. If realtime is unavailable because of RLS or project configuration, every mutation still refetches project data and the UI exposes Refresh Data buttons.
- Topbar notifications and dashboard activity remain visually live. They use real project/update-derived activity where available and local generated entries for immediate feedback.
- Advanced modules such as full donation processing, document storage, blood donor matching, chat expansion, and reports remain future phases. Their visible project-level buttons now provide safe toast feedback instead of remaining dead.
