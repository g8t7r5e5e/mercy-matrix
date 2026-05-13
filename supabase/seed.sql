-- WelfareOS / Mercy Matrix safe starter seed data
-- This seed intentionally does not create auth users, passwords, profiles, or secrets.

insert into public.wings (id, name, slug, description)
values
  ('11111111-1111-4111-8111-111111111111', 'Medical Aid Wing', 'medical-aid', 'Coordinates medical aid, patient support, and emergency healthcare cases.'),
  ('22222222-2222-4222-8222-222222222222', 'Blood Support Wing', 'blood-support', 'Coordinates blood requests, blood donor matching, and urgent transfusion support.'),
  ('33333333-3333-4333-8333-333333333333', 'Financial Aid Wing', 'financial-aid', 'Coordinates verified financial assistance requests and donor follow-up.'),
  ('44444444-4444-4444-8444-444444444444', 'Community Support Wing', 'community-support', 'Coordinates welfare campaigns, relief work, and community support projects.'),
  ('55555555-5555-4555-8555-555555555555', 'Volunteer Operations Wing', 'volunteer-operations', 'Coordinates volunteer assignments, field tasks, and operational support.')
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

-- Optional profile examples can be added later after Supabase Auth users exist.
-- Example shape only; do not run until replacing the UUID with a real auth.users.id:
-- insert into public.profiles (id, wing_id, full_name, role)
-- values ('00000000-0000-0000-0000-000000000000', null, 'Example Admin', 'super_admin');
