# Backend Integration Notes

## Phase 3: Supabase schema files

Phase 3 adds the initial Supabase/PostgreSQL database schema files for WelfareOS / Mercy Matrix:

- `supabase/schema.sql` defines the platform tables, enum types, relationships, indexes, comments, `updated_at` trigger support, and starter Row Level Security policies.
- `supabase/seed.sql` adds safe starter wing data only.

The application still uses the existing demo/local authentication flow. The UI is still not connected to Supabase, and this phase does not migrate login, routes, dashboards, components, or mock data.

Next phase recommendation: run the schema manually in Supabase, review RLS behavior with real development users, and then migrate authentication carefully in a dedicated phase.
