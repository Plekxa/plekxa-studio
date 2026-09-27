-- Plekxa Studio stabilisation migration.
-- Safe to run after the partially completed v1.2 migrations.
-- This intentionally removes custom auth.users triggers. Studio now creates
-- portal and Enterprise creator records explicitly from its protected server API.

do $$
declare trigger_record record;
begin
  for trigger_record in
    select tgname
    from pg_trigger
    where tgrelid = 'auth.users'::regclass
      and not tgisinternal
  loop
    execute format('drop trigger if exists %I on auth.users', trigger_record.tgname);
  end loop;
end $$;

-- Keep the Studio profile table compatible with the creator portal.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  creator_type text,
  updated_at timestamptz default now()
);
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists creator_type text;
alter table public.profiles add column if not exists updated_at timestamptz default now();

-- Keep application submissions compatible with both the original Studio and
-- Enterprise OS identity models. Do not remove existing columns or data.
create table if not exists public.creator_applications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  creator_id uuid,
  creator_user_id uuid references auth.users(id) on delete cascade,
  status text default 'pending',
  cover_letter text,
  portfolio_url text,
  review_notes text,
  rejection_reason text,
  applied_at timestamptz default now(),
  reviewed_at timestamptz,
  withdrawn_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.creator_applications add column if not exists project_id uuid references public.projects(id) on delete cascade;
alter table public.creator_applications add column if not exists creator_id uuid;
alter table public.creator_applications add column if not exists creator_user_id uuid references auth.users(id) on delete cascade;
alter table public.creator_applications add column if not exists status text default 'pending';
alter table public.creator_applications add column if not exists cover_letter text;
alter table public.creator_applications add column if not exists portfolio_url text;
alter table public.creator_applications add column if not exists review_notes text;
alter table public.creator_applications add column if not exists rejection_reason text;
alter table public.creator_applications add column if not exists applied_at timestamptz default now();
alter table public.creator_applications add column if not exists reviewed_at timestamptz;
alter table public.creator_applications add column if not exists withdrawn_at timestamptz;
alter table public.creator_applications add column if not exists created_at timestamptz default now();
alter table public.creator_applications add column if not exists updated_at timestamptz default now();

update public.creator_applications
set status = coalesce(status, 'pending'),
    applied_at = coalesce(applied_at, created_at, now()),
    created_at = coalesce(created_at, applied_at, now()),
    updated_at = coalesce(updated_at, created_at, now());

-- The Studio server uses the service role after verifying the signed-in user,
-- so RLS no longer blocks submissions. RLS remains enabled for direct browser access.
alter table public.creator_applications enable row level security;
