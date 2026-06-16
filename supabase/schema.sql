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
-- The seed script upserts these rows with bcrypt hashes:
--   admin@icare.edu   / admin123    -> role: admin
--   student@icare.edu / student123  -> role: student
--   faculty@icare.edu / faculty123  -> role: faculty
