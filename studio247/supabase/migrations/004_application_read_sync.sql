-- Plekxa shared application read/write repair. Safe to rerun.
alter table if exists public.creator_applications add column if not exists creator_user_id uuid;
alter table if exists public.creator_applications add column if not exists creator_id uuid;
alter table if exists public.creator_applications add column if not exists project_id uuid;
alter table if exists public.creator_applications add column if not exists status text default 'pending';
alter table if exists public.creator_applications add column if not exists cover_letter text;
alter table if exists public.creator_applications add column if not exists portfolio_url text;
alter table if exists public.creator_applications add column if not exists review_notes text;
alter table if exists public.creator_applications add column if not exists rejection_reason text;
alter table if exists public.creator_applications add column if not exists applied_at timestamptz default now();
alter table if exists public.creator_applications add column if not exists reviewed_at timestamptz;
alter table if exists public.creator_applications add column if not exists withdrawn_at timestamptz;
alter table if exists public.creator_applications add column if not exists updated_at timestamptz default now();

-- Backfill the auth user identifier where creator_id points to creator_profiles.id.
do $$
begin
  if exists(select 1 from information_schema.columns where table_schema='public' and table_name='creator_profiles' and column_name='user_id') then
    execute $sql$
      update public.creator_applications a
      set creator_user_id = c.user_id
      from public.creator_profiles c
      where a.creator_user_id is null and a.creator_id = c.id and c.user_id is not null
    $sql$;
  end if;
  if exists(select 1 from information_schema.columns where table_schema='public' and table_name='creator_profiles' and column_name='auth_user_id') then
    execute $sql$
      update public.creator_applications a
      set creator_user_id = c.auth_user_id
      from public.creator_profiles c
      where a.creator_user_id is null and a.creator_id = c.id and c.auth_user_id is not null
    $sql$;
  end if;
end $$;

create index if not exists creator_applications_creator_user_idx on public.creator_applications(creator_user_id);
create index if not exists creator_applications_creator_idx on public.creator_applications(creator_id);
create index if not exists creator_applications_project_idx on public.creator_applications(project_id);
create index if not exists creator_applications_status_idx on public.creator_applications(status);
