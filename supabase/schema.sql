-- Enable required extension
create extension if not exists pgcrypto;

-- User profile table synced with auth users
create table if not exists public.users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.horoscope_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sign text not null,
  query_payload jsonb not null,
  response_payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.kundali_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  birth_date date,
  birth_time text,
  latitude numeric,
  longitude numeric,
  timezone numeric,
  query_payload jsonb not null,
  response_payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.panchang_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  panchang_date date,
  latitude numeric,
  longitude numeric,
  timezone numeric,
  query_payload jsonb not null,
  response_payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.match_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  partner_one_name text,
  partner_two_name text,
  compatibility_score numeric,
  query_payload jsonb not null,
  response_payload jsonb not null,
  created_at timestamptz not null default now()
);

-- Keep updated_at in sync
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

-- Optional auto profile creation from auth
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (user_id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (user_id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

-- Row Level Security
alter table public.users enable row level security;
alter table public.horoscope_reports enable row level security;
alter table public.kundali_reports enable row level security;
alter table public.panchang_history enable row level security;
alter table public.match_results enable row level security;

-- Users policies
create policy "Users can read own profile"
on public.users for select
using (auth.uid() = user_id);

create policy "Users can insert own profile"
on public.users for insert
with check (auth.uid() = user_id);

create policy "Users can update own profile"
on public.users for update
using (auth.uid() = user_id);

-- Generic report policies
create policy "Users can manage own horoscope reports"
on public.horoscope_reports for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage own kundali reports"
on public.kundali_reports for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage own panchang history"
on public.panchang_history for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage own match results"
on public.match_results for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
