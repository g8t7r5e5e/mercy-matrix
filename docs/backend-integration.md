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
