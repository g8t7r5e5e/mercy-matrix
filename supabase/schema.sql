-- WelfareOS / Mercy Matrix Supabase schema
-- Phase 3: schema only. Run manually in Supabase SQL editor or via migrations.

create extension if not exists "pgcrypto";

-- Enumerated domain values used across the platform.
do $$
begin
  create type public.user_role as enum (
    'super_admin',
    'wing_head',
    'member',
    'volunteer',
    'general_user',
    'donor',
    'blood_donor'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.project_status as enum (
    'pending_review',
    'verified',
    'assigned',
    'active',
    'partially_funded',
    'donor_matched',
    'completed',
    'closed',
    'archived',
    'rejected'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.project_type as enum (
    'medical_aid',
    'blood_request',
    'financial_aid',
    'welfare_campaign',
    'community_support',
    'emergency_support'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.urgency_level as enum ('low', 'medium', 'high', 'critical');
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.wings (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.wings is 'Operational wings or teams that own and coordinate Mercy Matrix projects.';

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  wing_id uuid references public.wings(id) on delete set null,
  full_name text,
  display_name text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'general_user',
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.profiles is 'Application profile for each Supabase auth user, including platform role and optional wing membership.';

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  wing_id uuid references public.wings(id) on delete set null,
  submitted_by uuid references public.profiles(id) on delete set null,
  assigned_to uuid references public.profiles(id) on delete set null,
  title text not null,
  summary text,
  description text,
  project_type public.project_type not null,
  status public.project_status not null default 'pending_review',
  urgency public.urgency_level not null default 'medium',
  beneficiary_name text,
  beneficiary_contact text,
  location text,
  target_amount numeric(12,2) check (target_amount is null or target_amount >= 0),
  raised_amount numeric(12,2) not null default 0 check (raised_amount >= 0),
  needed_by date,
  verified_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.projects is 'Central case, campaign, request, or support project that all major Mercy Matrix records connect back to.';

create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  title text,
  body text not null,
  status public.project_status,
  is_public boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.project_updates is 'Timeline updates and status notes for a project.';

create table if not exists public.project_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  message text not null,
  is_internal boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.project_messages is 'Conversation messages visible to users connected to the related project.';

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  donor_id uuid references public.profiles(id) on delete set null,
  donor_name text,
  donor_email text,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'USD',
  payment_method text,
  payment_reference text,
  status text not null default 'pledged',
  donated_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.donations is 'Donor pledges and contributions tied to a Mercy Matrix project.';

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  recorded_by uuid references public.profiles(id) on delete set null,
  title text not null,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'USD',
  expense_date date not null default current_date,
  vendor text,
  receipt_document_id uuid,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.expenses is 'Project spending records for transparent fund usage tracking.';

create table if not exists public.blood_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  requested_by uuid references public.profiles(id) on delete set null,
  patient_name text,
  blood_group text not null,
  units_needed integer not null check (units_needed > 0),
  hospital_name text,
  hospital_address text,
  required_by timestamptz,
  contact_name text,
  contact_phone text,
  status text not null default 'open',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.blood_requests is 'Blood-specific request details linked one-to-one with a blood request project.';

create table if not exists public.blood_donors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  full_name text not null,
  phone text,
  blood_group text not null,
  location text,
  last_donation_date date,
  is_available boolean not null default true,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.blood_donors is 'Blood donor registrations and optional matching context for project-based blood requests.';

create table if not exists public.volunteers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  wing_id uuid references public.wings(id) on delete set null,
  full_name text not null,
  phone text,
  skills text[] not null default '{}'::text[],
  availability text,
  status text not null default 'available',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.volunteers is 'Volunteer registrations and project assignments.';

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  name text not null,
  document_type text,
  storage_bucket text,
  storage_path text,
  public_url text,
  mime_type text,
  file_size bigint check (file_size is null or file_size >= 0),
  is_sensitive boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.documents is 'Project evidence, receipts, medical files, and support documents stored via Supabase Storage metadata.';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'expenses_receipt_document_id_fkey'
      and conrelid = 'public.expenses'::regclass
  ) then
    alter table public.expenses
      add constraint expenses_receipt_document_id_fkey
      foreign key (receipt_document_id) references public.documents(id) on delete set null;
  end if;
end $$;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'todo',
  priority public.urgency_level not null default 'medium',
  due_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.tasks is 'Action items and operational work connected to projects.';

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  body text,
  type text not null default 'info',
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.notifications is 'Per-user notifications; RLS limits visibility to the intended recipient.';

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_table text,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
comment on table public.audit_logs is 'Administrative audit trail for important project and platform changes.';

-- Helpful indexes for common access paths.
create index if not exists idx_profiles_wing_id on public.profiles(wing_id);
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_created_at on public.profiles(created_at desc);
create index if not exists idx_projects_wing_id on public.projects(wing_id);
create index if not exists idx_projects_submitted_by on public.projects(submitted_by);
create index if not exists idx_projects_assigned_to on public.projects(assigned_to);
create index if not exists idx_projects_status on public.projects(status);
create index if not exists idx_projects_urgency on public.projects(urgency);
create index if not exists idx_projects_created_at on public.projects(created_at desc);
create index if not exists idx_project_updates_project_id on public.project_updates(project_id);
create index if not exists idx_project_updates_author_id on public.project_updates(author_id);
create index if not exists idx_project_updates_created_at on public.project_updates(created_at desc);
create index if not exists idx_project_messages_project_id on public.project_messages(project_id);
create index if not exists idx_project_messages_sender_id on public.project_messages(sender_id);
create index if not exists idx_project_messages_created_at on public.project_messages(created_at desc);
create index if not exists idx_donations_project_id on public.donations(project_id);
create index if not exists idx_donations_donor_id on public.donations(donor_id);
create index if not exists idx_donations_status on public.donations(status);
create index if not exists idx_donations_created_at on public.donations(created_at desc);
create index if not exists idx_expenses_project_id on public.expenses(project_id);
create index if not exists idx_expenses_recorded_by on public.expenses(recorded_by);
create index if not exists idx_expenses_created_at on public.expenses(created_at desc);
create index if not exists idx_blood_requests_project_id on public.blood_requests(project_id);
create index if not exists idx_blood_requests_requested_by on public.blood_requests(requested_by);
create index if not exists idx_blood_requests_status on public.blood_requests(status);
create index if not exists idx_blood_donors_user_id on public.blood_donors(user_id);
create index if not exists idx_blood_donors_project_id on public.blood_donors(project_id);
create index if not exists idx_blood_donors_created_at on public.blood_donors(created_at desc);
create index if not exists idx_volunteers_user_id on public.volunteers(user_id);
create index if not exists idx_volunteers_project_id on public.volunteers(project_id);
create index if not exists idx_volunteers_wing_id on public.volunteers(wing_id);
create index if not exists idx_documents_project_id on public.documents(project_id);
create index if not exists idx_documents_uploaded_by on public.documents(uploaded_by);
create index if not exists idx_tasks_project_id on public.tasks(project_id);
create index if not exists idx_tasks_assigned_to on public.tasks(assigned_to);
create index if not exists idx_tasks_created_by on public.tasks(created_by);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_notifications_recipient_id on public.notifications(recipient_id);
create index if not exists idx_notifications_project_id on public.notifications(project_id);
create index if not exists idx_notifications_created_at on public.notifications(created_at desc);
create index if not exists idx_audit_logs_project_id on public.audit_logs(project_id);
create index if not exists idx_audit_logs_actor_id on public.audit_logs(actor_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);

-- updated_at triggers.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'wings', 'profiles', 'projects', 'project_updates', 'project_messages',
    'donations', 'expenses', 'blood_requests', 'blood_donors', 'volunteers',
    'documents', 'tasks', 'notifications'
  ]
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end $$;

-- RLS helper functions. SECURITY DEFINER avoids recursive policy lookups on profiles.
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and is_active = true
$$;

create or replace function public.current_user_wing_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select wing_id from public.profiles where id = auth.uid() and is_active = true
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'super_admin', false)
$$;

create or replace function public.can_access_project(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects p
    where p.id = target_project_id
      and (
        public.is_super_admin()
        or p.submitted_by = auth.uid()
        or p.assigned_to = auth.uid()
        or (
          public.current_user_role() = 'wing_head'
          and p.wing_id = public.current_user_wing_id()
        )
        or exists (
          select 1 from public.tasks t
          where t.project_id = p.id and t.assigned_to = auth.uid()
        )
        or exists (
          select 1 from public.volunteers v
          where v.project_id = p.id and v.user_id = auth.uid()
        )
        or exists (
          select 1 from public.donations d
          where d.project_id = p.id and d.donor_id = auth.uid()
        )
        or exists (
          select 1 from public.blood_donors bd
          where bd.project_id = p.id and bd.user_id = auth.uid()
        )
      )
  )
$$;

-- Enable Row Level Security on application tables.
alter table public.wings enable row level security;
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_updates enable row level security;
alter table public.project_messages enable row level security;
alter table public.donations enable row level security;
alter table public.expenses enable row level security;
alter table public.blood_requests enable row level security;
alter table public.blood_donors enable row level security;
alter table public.volunteers enable row level security;
alter table public.documents enable row level security;
alter table public.tasks enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- Starter policies. These are intentionally safe for initial development and can be hardened later.
-- Super admins have broad table access for initial administration.
create policy "super admins manage profiles"
  on public.profiles for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "super admins manage projects"
  on public.projects for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "super admins manage project updates"
  on public.project_updates for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "super admins manage project messages"
  on public.project_messages for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "super admins manage donations"
  on public.donations for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "super admins manage expenses"
  on public.expenses for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "super admins manage blood requests"
  on public.blood_requests for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "super admins manage blood donors"
  on public.blood_donors for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "super admins manage volunteers"
  on public.volunteers for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "super admins manage documents"
  on public.documents for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "super admins manage tasks"
  on public.tasks for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "super admins manage notifications"
  on public.notifications for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "super admins manage audit logs"
  on public.audit_logs for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "wings are readable by authenticated users"
  on public.wings for select
  to authenticated
  using (true);

create policy "admins manage wings"
  on public.wings for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "profiles readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_super_admin())
  with check (id = auth.uid() or public.is_super_admin());

create policy "users insert own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid() or public.is_super_admin());

create policy "projects accessible to connected users"
  on public.projects for select
  to authenticated
  using (public.can_access_project(id));

create policy "users submit own projects"
  on public.projects for insert
  to authenticated
  with check (submitted_by = auth.uid() or public.is_super_admin());

create policy "admins wing heads and assignees update projects"
  on public.projects for update
  to authenticated
  using (
    public.is_super_admin()
    or assigned_to = auth.uid()
    or submitted_by = auth.uid()
    or (public.current_user_role() = 'wing_head' and wing_id = public.current_user_wing_id())
  )
  with check (
    public.is_super_admin()
    or assigned_to = auth.uid()
    or submitted_by = auth.uid()
    or (public.current_user_role() = 'wing_head' and wing_id = public.current_user_wing_id())
  );

create policy "connected users read project updates"
  on public.project_updates for select
  to authenticated
  using (public.can_access_project(project_id) or is_public = true);

create policy "connected users create project updates"
  on public.project_updates for insert
  to authenticated
  with check (public.can_access_project(project_id) and (author_id = auth.uid() or public.is_super_admin()));

create policy "connected users read project messages"
  on public.project_messages for select
  to authenticated
  using (public.can_access_project(project_id));

create policy "connected users create project messages"
  on public.project_messages for insert
  to authenticated
  with check (public.can_access_project(project_id) and (sender_id = auth.uid() or public.is_super_admin()));

create policy "donors read own donations and project staff read project donations"
  on public.donations for select
  to authenticated
  using (donor_id = auth.uid() or public.can_access_project(project_id));

create policy "donors create own donations"
  on public.donations for insert
  to authenticated
  with check (donor_id = auth.uid() or public.is_super_admin());

create policy "project staff manage expenses"
  on public.expenses for all
  to authenticated
  using (public.can_access_project(project_id))
  with check (public.can_access_project(project_id));

create policy "connected users read blood requests"
  on public.blood_requests for select
  to authenticated
  using (public.can_access_project(project_id));

create policy "connected users manage blood requests"
  on public.blood_requests for all
  to authenticated
  using (public.can_access_project(project_id))
  with check (public.can_access_project(project_id));

create policy "blood donors read own record and connected project records"
  on public.blood_donors for select
  to authenticated
  using (user_id = auth.uid() or public.can_access_project(project_id));

create policy "blood donors manage own record"
  on public.blood_donors for all
  to authenticated
  using (user_id = auth.uid() or public.is_super_admin())
  with check (user_id = auth.uid() or public.is_super_admin());

create policy "volunteers read own record and connected project records"
  on public.volunteers for select
  to authenticated
  using (user_id = auth.uid() or public.can_access_project(project_id) or public.is_super_admin());

create policy "volunteers manage own record"
  on public.volunteers for all
  to authenticated
  using (user_id = auth.uid() or public.is_super_admin())
  with check (user_id = auth.uid() or public.is_super_admin());

create policy "connected users read documents"
  on public.documents for select
  to authenticated
  using (public.can_access_project(project_id));

create policy "connected users create documents"
  on public.documents for insert
  to authenticated
  with check (public.can_access_project(project_id) and (uploaded_by = auth.uid() or public.is_super_admin()));

create policy "connected users read tasks"
  on public.tasks for select
  to authenticated
  using (public.can_access_project(project_id) or assigned_to = auth.uid() or created_by = auth.uid());

create policy "connected users manage tasks"
  on public.tasks for all
  to authenticated
  using (public.can_access_project(project_id) or assigned_to = auth.uid() or created_by = auth.uid())
  with check (public.can_access_project(project_id) or assigned_to = auth.uid() or created_by = auth.uid());

create policy "recipients read own notifications"
  on public.notifications for select
  to authenticated
  using (recipient_id = auth.uid() or public.is_super_admin());

create policy "recipients update own notifications"
  on public.notifications for update
  to authenticated
  using (recipient_id = auth.uid() or public.is_super_admin())
  with check (recipient_id = auth.uid() or public.is_super_admin());

create policy "admins create notifications"
  on public.notifications for insert
  to authenticated
  with check (public.is_super_admin() or public.can_access_project(project_id));

create policy "super admins read audit logs"
  on public.audit_logs for select
  to authenticated
  using (public.is_super_admin());

create policy "super admins create audit logs"
  on public.audit_logs for insert
  to authenticated
  with check (public.is_super_admin());
