-- =================================================================
-- iCARE++ Supabase schema
-- Run this once in the Supabase SQL Editor (Project -> SQL -> New query)
-- =================================================================

create extension if not exists pgcrypto;

do $$ begin
  create type user_role as enum ('student', 'faculty', 'admin');
exception when duplicate_object then null; end $$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  google_sub text unique,
  email text unique not null,
  name text not null,
  picture_url text,
  role user_role not null default 'student',
  password_hash text,
  force_password_change boolean not null default false,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

alter table public.users enable row level security;

-- Users can read their own row (matched via Supabase auth.uid()).
-- Server-side calls use the service role key, which bypasses RLS.
create policy "users can read own row" on public.users
  for select using (auth.uid()::text = google_sub);

-- =================================================================
-- Seed data: three test accounts for local development.
-- After running this, also run `npm run db:seed` to insert the
-- matching password hashes (or paste the SQL produced by the script
-- directly into the editor).
-- =================================================================
-- The seed script upserts these rows with bcrypt hashes.
-- Set SEED_ADMIN_PASSWORD, SEED_STUDENT_PASSWORD, and SEED_FACULTY_PASSWORD
-- in your environment before running `npm run db:seed`.

-- =================================================================
-- Password resets (OTP-based)
-- =================================================================

create table if not exists public.password_resets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  otp_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

-- Index for fast lookup of the latest active reset for a user
create index if not exists idx_password_resets_user_created
  on public.password_resets(user_id, created_at desc);

-- Only service-role/admin operations should touch this table directly.
-- No RLS policy is needed because server-side code bypasses RLS with the
-- service role key, and end users never query it themselves.

-- =================================================================
-- Patients table for MIMIC-IV demo (and eventually full MIMIC-IV) data
-- =================================================================

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  subject_id bigint not null,
  hadm_id bigint,
  name text not null,
  age int,
  gender text,
  room_number text,
  diagnosis text,
  admission_date timestamptz,
  vital_signs jsonb not null default '{}'::jsonb,
  labs jsonb not null default '{}'::jsonb,
  mimic_id text not null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_patients_subject_id on public.patients(subject_id);
create index if not exists idx_patients_hadm_id on public.patients(hadm_id);
create index if not exists idx_patients_mimic_id on public.patients(mimic_id);
create index if not exists idx_patients_created_by on public.patients(created_by);

alter table public.patients
  drop constraint if exists uq_patients_subject_hadm;
alter table public.patients
  add constraint uq_patients_subject_hadm unique (subject_id, hadm_id);

alter table public.patients enable row level security;

create policy "faculty and students can read patients" on public.patients
  for select using (
    exists (
      select 1 from public.users
      where public.users.id = auth.uid()
        and public.users.role in ('student', 'faculty', 'admin')
    )
  );

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_patients_updated_at on public.patients;
create trigger trg_patients_updated_at
  before update on public.patients
  for each row execute function public.set_updated_at();
