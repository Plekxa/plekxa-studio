-- Plekxa Studio v1.2.3 / Enterprise OS shared operational schema (rerunnable compatibility edition).
-- Run after all Enterprise OS migrations and Studio migration 001 in the SAME Supabase project.
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Creator portal profile: a strictly synchronized auth-facing projection of
-- Enterprise OS creator_profiles. Studio keeps its existing API while Admin
-- remains authoritative through creator_profiles.
-- ---------------------------------------------------------------------------
-- ON CONFLICT (user_id) requires a non-partial unique index. PostgreSQL
-- still permits multiple NULL values in a normal unique index.
drop index if exists public.creator_profiles_user_id_unique;
create unique index creator_profiles_user_id_unique on public.creator_profiles(user_id);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  enterprise_creator_id uuid unique references public.creator_profiles(id) on delete cascade,
  email text,
  full_name text,
  professional_name text,
  creator_type text,
  bio text,
  location text,
  availability text,
  avatar_url text,
  portfolio_url text,
  skills text[] not null default '{}',
  genres text[] not null default '{}',
  stripe_account_id text,
  stripe_details_submitted boolean not null default false,
  stripe_payouts_enabled boolean not null default false,
  paypal_email text,
  preferred_payout_method text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Existing Studio installations already have public.profiles. CREATE TABLE IF NOT
-- EXISTS does not add new columns, so upgrade that table explicitly. This block
-- also makes the migration safe to rerun after a partial failure.
alter table public.profiles add column if not exists enterprise_creator_id uuid references public.creator_profiles(id) on delete cascade;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists professional_name text;
alter table public.profiles add column if not exists creator_type text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists availability text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists portfolio_url text;
alter table public.profiles add column if not exists skills text[] not null default '{}';
alter table public.profiles add column if not exists genres text[] not null default '{}';
alter table public.profiles add column if not exists stripe_account_id text;
alter table public.profiles add column if not exists stripe_details_submitted boolean not null default false;
alter table public.profiles add column if not exists stripe_payouts_enabled boolean not null default false;
alter table public.profiles add column if not exists paypal_email text;
alter table public.profiles add column if not exists preferred_payout_method text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
create unique index if not exists profiles_enterprise_creator_id_unique
  on public.profiles(enterprise_creator_id) where enterprise_creator_id is not null;

create or replace function public.sync_portal_profile_to_enterprise()
returns trigger language plpgsql security definer set search_path=public as $$
declare cp_id uuid;
begin
  if pg_trigger_depth() > 1 then return new; end if;
  insert into public.creator_profiles(
    user_id, legal_name, stage_name, email, genres, skills, bio, portfolio_url,
    metadata, created_at, updated_at
  ) values (
    new.id,
    coalesce(nullif(new.full_name,''), split_part(coalesce(new.email,''),'@',1), 'Creator'),
    nullif(new.professional_name,''), new.email,
    coalesce(new.genres,'{}'), coalesce(new.skills,'{}'), new.bio, new.portfolio_url,
    jsonb_strip_nulls(jsonb_build_object(
      'creator_type',new.creator_type,'location',new.location,'availability',new.availability,
      'avatar_url',new.avatar_url,'stripe_account_id',new.stripe_account_id,
      'stripe_details_submitted',new.stripe_details_submitted,
      'stripe_payouts_enabled',new.stripe_payouts_enabled,
      'paypal_email',new.paypal_email,'preferred_payout_method',new.preferred_payout_method,
      'source','plekxa-studio'
    )), now(), now()
  )
  on conflict (user_id) do update set
    legal_name=excluded.legal_name, stage_name=excluded.stage_name, email=excluded.email,
    genres=excluded.genres, skills=excluded.skills, bio=excluded.bio,
    portfolio_url=excluded.portfolio_url,
    metadata=public.creator_profiles.metadata || excluded.metadata,
    updated_at=now()
  returning id into cp_id;
  new.enterprise_creator_id := cp_id;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists profiles_sync_enterprise on public.profiles;
create trigger profiles_sync_enterprise before insert or update on public.profiles
for each row execute function public.sync_portal_profile_to_enterprise();

create or replace function public.sync_enterprise_profile_to_portal()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if pg_trigger_depth() > 1 or new.user_id is null then return new; end if;
  insert into public.profiles(
    id, enterprise_creator_id, email, full_name, professional_name, creator_type,
    bio, location, availability, avatar_url, portfolio_url, skills, genres, updated_at
  ) values (
    new.user_id,new.id,new.email,new.legal_name,new.stage_name,new.metadata->>'creator_type',
    new.bio,new.metadata->>'location',new.metadata->>'availability',new.metadata->>'avatar_url',
    new.portfolio_url,new.skills,new.genres,now()
  ) on conflict(id) do update set
    enterprise_creator_id=excluded.enterprise_creator_id,email=excluded.email,
    full_name=excluded.full_name,professional_name=excluded.professional_name,
    creator_type=coalesce(excluded.creator_type,public.profiles.creator_type),
    bio=excluded.bio,location=coalesce(excluded.location,public.profiles.location),
    availability=coalesce(excluded.availability,public.profiles.availability),
    avatar_url=coalesce(excluded.avatar_url,public.profiles.avatar_url),
    portfolio_url=excluded.portfolio_url,skills=excluded.skills,genres=excluded.genres,updated_at=now();
  return new;
end $$;

drop trigger if exists creator_profiles_sync_portal on public.creator_profiles;
create trigger creator_profiles_sync_portal after insert or update on public.creator_profiles
for each row execute function public.sync_enterprise_profile_to_portal();

insert into public.profiles(id,enterprise_creator_id,email,full_name,professional_name,creator_type,bio,location,availability,avatar_url,portfolio_url,skills,genres)
select user_id,id,email,legal_name,stage_name,metadata->>'creator_type',bio,metadata->>'location',metadata->>'availability',metadata->>'avatar_url',portfolio_url,skills,genres
from public.creator_profiles where user_id is not null
on conflict(id) do nothing;

-- ---------------------------------------------------------------------------
-- Projects: one projects table, with Studio presentation aliases synchronized
-- to Enterprise OS fields.
-- ---------------------------------------------------------------------------
-- Upgrade either an older Studio projects table or the Enterprise OS table.
-- Add the canonical Enterprise OS columns first, then the Studio presentation aliases.
alter table public.projects add column if not exists name text;
alter table public.projects add column if not exists slug text;
alter table public.projects add column if not exists project_type text;
alter table public.projects add column if not exists description text;
alter table public.projects add column if not exists owner_id uuid references auth.users(id);
alter table public.projects add column if not exists department_id uuid references public.departments(id);
alter table public.projects add column if not exists status text default 'planning';
alter table public.projects add column if not exists priority text default 'normal';
alter table public.projects add column if not exists budget numeric(14,2);
alter table public.projects add column if not exists currency char(3) default 'USD';
alter table public.projects add column if not exists starts_at date;
alter table public.projects add column if not exists due_at date;
alter table public.projects add column if not exists completed_at date;
alter table public.projects add column if not exists progress integer default 0;
alter table public.projects add column if not exists metadata jsonb default '{}'::jsonb;
alter table public.projects add column if not exists created_at timestamptz default now();
alter table public.projects add column if not exists updated_at timestamptz default now();

alter table public.projects add column if not exists title text;
alter table public.projects add column if not exists summary text;
alter table public.projects add column if not exists department text;
alter table public.projects add column if not exists deadline timestamptz;

create or replace function public.sync_project_portal_fields()
returns trigger language plpgsql as $$
begin
  new.name := coalesce(nullif(new.name,''),nullif(new.title,''),'Untitled project');
  new.title := coalesce(nullif(new.title,''),new.name);
  new.summary := coalesce(new.summary,new.description);
  new.description := coalesce(new.description,new.summary);
  if new.deadline is null and new.due_at is not null then new.deadline := new.due_at::timestamptz; end if;
  if new.due_at is null and new.deadline is not null then new.due_at := new.deadline::date; end if;
  return new;
end $$;
drop trigger if exists projects_portal_fields on public.projects;
create trigger projects_portal_fields before insert or update on public.projects
for each row execute function public.sync_project_portal_fields();
update public.projects
set name = coalesce(nullif(name,''), nullif(title,''), 'Untitled project'),
    title = coalesce(nullif(title,''), nullif(name,''), 'Untitled project'),
    description = coalesce(description, summary),
    summary = coalesce(summary, description),
    due_at = coalesce(due_at, deadline::date),
    deadline = coalesce(deadline, due_at::timestamptz),
    metadata = coalesce(metadata, '{}'::jsonb),
    status = coalesce(status, 'planning'),
    priority = coalesce(priority, 'normal'),
    progress = coalesce(progress, 0),
    created_at = coalesce(created_at, now()),
    updated_at = coalesce(updated_at, now());

-- ---------------------------------------------------------------------------
-- Applications: canonical Enterprise OS records with Studio-facing fields.
-- Existing Studio installations may have a much smaller creator_applications
-- table. Create/upgrade every field before indexes, triggers or data repair use it.
-- ---------------------------------------------------------------------------
create table if not exists public.creator_applications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references public.project_opportunities(id) on delete set null,
  project_id uuid references public.projects(id) on delete cascade,
  creator_id uuid references public.creator_profiles(id) on delete cascade,
  creator_user_id uuid references auth.users(id) on delete cascade,
  status text not null default 'pending',
  answers jsonb not null default '{}'::jsonb,
  cover_letter text,
  portfolio_url text,
  review_notes text,
  rejection_reason text,
  applied_at timestamptz not null default now(),
  reviewed_at timestamptz,
  withdrawn_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.creator_applications add column if not exists opportunity_id uuid references public.project_opportunities(id) on delete set null;
alter table public.creator_applications add column if not exists project_id uuid references public.projects(id) on delete cascade;
alter table public.creator_applications add column if not exists creator_id uuid references public.creator_profiles(id) on delete cascade;
alter table public.creator_applications add column if not exists creator_user_id uuid references auth.users(id) on delete cascade;
alter table public.creator_applications add column if not exists status text default 'pending';
alter table public.creator_applications add column if not exists answers jsonb default '{}'::jsonb;
alter table public.creator_applications add column if not exists cover_letter text;
alter table public.creator_applications add column if not exists portfolio_url text;
alter table public.creator_applications add column if not exists review_notes text;
alter table public.creator_applications add column if not exists rejection_reason text;
alter table public.creator_applications add column if not exists applied_at timestamptz default now();
alter table public.creator_applications add column if not exists reviewed_at timestamptz;
alter table public.creator_applications add column if not exists withdrawn_at timestamptz;
alter table public.creator_applications add column if not exists created_at timestamptz default now();
alter table public.creator_applications add column if not exists updated_at timestamptz default now();
alter table public.creator_applications alter column opportunity_id drop not null;
update public.creator_applications set
  status=coalesce(status,'pending'), answers=coalesce(answers,'{}'::jsonb),
  applied_at=coalesce(applied_at,created_at,now()), created_at=coalesce(created_at,now()),
  updated_at=coalesce(updated_at,created_at,now());

create unique index if not exists creator_applications_project_user_active_idx
on public.creator_applications(project_id,creator_user_id)
where status in ('pending','submitted','under_review','accepted');

create or replace function public.prepare_creator_application()
returns trigger language plpgsql security definer set search_path=public as $$
declare cp uuid; opp uuid;
begin
  if new.creator_user_id is null and new.creator_id is not null then
    select user_id into new.creator_user_id from public.creator_profiles where id=new.creator_id;
  end if;
  if new.creator_id is null and new.creator_user_id is not null then
    select id into cp from public.creator_profiles where user_id=new.creator_user_id;
    new.creator_id := cp;
  end if;
  if new.project_id is null and new.opportunity_id is not null then
    select project_id into new.project_id from public.project_opportunities where id=new.opportunity_id;
  end if;
  if new.opportunity_id is null and new.project_id is not null then
    select id into opp from public.project_opportunities where project_id=new.project_id order by created_at limit 1;
    if opp is null then
      insert into public.project_opportunities(project_id,role_name,status,opens_at)
      values(new.project_id,'General creator','open',now()) returning id into opp;
    end if;
    new.opportunity_id := opp;
  end if;
  new.answers := coalesce(new.answers,'{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object('cover_letter',new.cover_letter,'portfolio_url',new.portfolio_url));
  if new.status='submitted' then new.status:='pending'; end if;
  new.updated_at:=now();
  return new;
end $$;
drop trigger if exists creator_applications_prepare on public.creator_applications;
create trigger creator_applications_prepare before insert or update on public.creator_applications
for each row execute function public.prepare_creator_application();

create or replace function public.withdraw_creator_application(application_uuid uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
 update public.creator_applications set status='withdrawn',withdrawn_at=now(),updated_at=now()
 where id=application_uuid and creator_user_id=auth.uid() and status in ('pending','under_review');
 if not found then raise exception 'Application cannot be withdrawn'; end if;
end $$;

-- ---------------------------------------------------------------------------
-- Proposals: same table in both products. Upgrade legacy Studio/Admin variants
-- before the synchronization trigger references their columns.
-- ---------------------------------------------------------------------------
create table if not exists public.proposals (
 id uuid primary key default gen_random_uuid(), owner_id uuid references auth.users(id),
 creator_id uuid references public.creator_profiles(id), creator_user_id uuid references auth.users(id) on delete cascade,
 proposer_type text default 'creator', proposer_id uuid, title text, description text, department text, format text,
 estimated_timeline text, estimated_budget numeric(14,2), portfolio_url text, concept jsonb default '{}'::jsonb,
 status text default 'draft', submitted_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now()
);
alter table public.proposals add column if not exists owner_id uuid references auth.users(id);
alter table public.proposals add column if not exists proposer_type text default 'creator';
alter table public.proposals add column if not exists proposer_id uuid;
alter table public.proposals add column if not exists title text;
alter table public.proposals add column if not exists concept jsonb default '{}'::jsonb;
alter table public.proposals add column if not exists status text default 'draft';
alter table public.proposals add column if not exists created_at timestamptz default now();
alter table public.proposals add column if not exists updated_at timestamptz default now();
alter table public.proposals add column if not exists creator_id uuid references public.creator_profiles(id);
alter table public.proposals add column if not exists creator_user_id uuid references auth.users(id) on delete cascade;
alter table public.proposals add column if not exists description text;
alter table public.proposals add column if not exists department text;
alter table public.proposals add column if not exists format text;
alter table public.proposals add column if not exists estimated_timeline text;
alter table public.proposals add column if not exists estimated_budget numeric(14,2);
alter table public.proposals add column if not exists portfolio_url text;
alter table public.proposals add column if not exists submitted_at timestamptz;
create or replace function public.prepare_creator_proposal()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.creator_user_id is null then new.creator_user_id:=new.owner_id; end if;
 if new.owner_id is null then new.owner_id:=new.creator_user_id; end if;
 if new.creator_id is null and new.creator_user_id is not null then select id into new.creator_id from public.creator_profiles where user_id=new.creator_user_id; end if;
 new.proposer_type:=coalesce(new.proposer_type,'creator'); new.proposer_id:=coalesce(new.proposer_id,new.creator_id);
 new.concept:=coalesce(new.concept,'{}') || jsonb_strip_nulls(jsonb_build_object('description',new.description,'department',new.department,'format',new.format,'estimated_timeline',new.estimated_timeline,'estimated_budget',new.estimated_budget,'portfolio_url',new.portfolio_url));
 if new.status='submitted' and new.submitted_at is null then new.submitted_at:=now(); end if;
 new.updated_at:=now(); return new;
end $$;
drop trigger if exists proposals_prepare_creator on public.proposals;
create trigger proposals_prepare_creator before insert or update on public.proposals for each row execute function public.prepare_creator_proposal();

-- ---------------------------------------------------------------------------
-- Contracts and workspaces: canonical contracts extended for creator portal.
-- ---------------------------------------------------------------------------
create table if not exists public.contracts (
 id uuid primary key default gen_random_uuid(), project_id uuid references public.projects(id),
 status text default 'draft', effective_at date, expires_at date,
 created_at timestamptz default now(), updated_at timestamptz default now()
);
alter table public.contracts add column if not exists project_id uuid references public.projects(id);
alter table public.contracts add column if not exists status text default 'draft';
alter table public.contracts add column if not exists effective_at date;
alter table public.contracts add column if not exists expires_at date;
alter table public.contracts add column if not exists created_at timestamptz default now();
alter table public.contracts add column if not exists updated_at timestamptz default now();
alter table public.contracts add column if not exists application_id uuid references public.creator_applications(id);
alter table public.contracts add column if not exists creator_id uuid references public.creator_profiles(id);
alter table public.contracts add column if not exists creator_user_id uuid references auth.users(id) on delete cascade;
alter table public.contracts add column if not exists project_title text;
alter table public.contracts add column if not exists contract_number text;
alter table public.contracts add column if not exists currency char(3) default 'USD';
alter table public.contracts add column if not exists total_amount numeric(14,2) default 0;
alter table public.contracts add column if not exists start_date date;
alter table public.contracts add column if not exists end_date date;
alter table public.contracts add column if not exists content jsonb not null default '{}';
alter table public.contracts add column if not exists sent_at timestamptz;
alter table public.contracts add column if not exists creator_signed_at timestamptz;
alter table public.contracts add column if not exists client_signed_at timestamptz;
alter table public.contracts add column if not exists activated_at timestamptz;
alter table public.contracts add column if not exists completed_at timestamptz;
alter table public.contracts add column if not exists cancelled_at timestamptz;

create table if not exists public.contract_milestones(
 id uuid primary key default gen_random_uuid(), contract_id uuid not null references public.contracts(id) on delete cascade,
 title text not null, description text, amount numeric(14,2) not null default 0, due_date date,
 status text not null default 'pending', position integer not null default 0, submitted_at timestamptz,
 approved_at timestamptz, paid_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.contract_signatures(
 id uuid primary key default gen_random_uuid(), contract_id uuid not null references public.contracts(id) on delete cascade,
 signer_id uuid references auth.users(id), party text not null, signature_name text not null, signed_at timestamptz not null default now(),
 ip_address text, user_agent text
);
create table if not exists public.contract_events(
 id uuid primary key default gen_random_uuid(), contract_id uuid not null references public.contracts(id) on delete cascade,
 actor_id uuid references auth.users(id), event_type text not null, description text not null,
 metadata jsonb not null default '{}', created_at timestamptz not null default now()
);
create table if not exists public.creator_project_workspaces(
 id uuid primary key default gen_random_uuid(), contract_id uuid not null unique references public.contracts(id) on delete cascade,
 project_id uuid not null references public.projects(id) on delete cascade, creator_id uuid not null references auth.users(id) on delete cascade,
 enterprise_creator_id uuid references public.creator_profiles(id), title text not null, status text not null default 'active',
 started_at timestamptz not null default now(), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create or replace function public.prepare_creator_contract()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.creator_user_id is null and new.creator_id is not null then select user_id into new.creator_user_id from public.creator_profiles where id=new.creator_id; end if;
 if new.creator_id is null and new.creator_user_id is not null then select id into new.creator_id from public.creator_profiles where user_id=new.creator_user_id; end if;
 if new.project_title is null and new.project_id is not null then select coalesce(title,name) into new.project_title from public.projects where id=new.project_id; end if;
 new.contract_number:=coalesce(new.contract_number,'PLX-'||upper(substr(replace(new.id::text,'-',''),1,10)));
 new.start_date:=coalesce(new.start_date,new.effective_at); new.end_date:=coalesce(new.end_date,new.expires_at);
 return new;
end $$;
drop trigger if exists contracts_prepare_creator on public.contracts;
create trigger contracts_prepare_creator before insert or update on public.contracts for each row execute function public.prepare_creator_contract();

create or replace function public.creator_sign_contract(contract_uuid uuid,typed_signature text,signer_ip text default null,signer_user_agent text default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare c public.contracts%rowtype;
begin
 select * into c from public.contracts where id=contract_uuid and creator_user_id=auth.uid() for update;
 if not found then raise exception 'Contract not found'; end if;
 if c.status not in ('sent','draft','creator_signed') then raise exception 'This contract cannot be signed'; end if;
 insert into public.contract_signatures(contract_id,signer_id,party,signature_name,ip_address,user_agent)
 values(c.id,auth.uid(),'creator',typed_signature,signer_ip,signer_user_agent);
 update public.contracts set status='creator_signed',creator_signed_at=now(),updated_at=now() where id=c.id;
 insert into public.contract_events(contract_id,actor_id,event_type,description) values(c.id,auth.uid(),'creator_signed','Creator signed the contract');
 return jsonb_build_object('contract_id',c.id,'status','creator_signed');
end $$;

-- ---------------------------------------------------------------------------
-- Shared notifications.
-- ---------------------------------------------------------------------------
create table if not exists public.notifications(
 id uuid primary key default gen_random_uuid(), recipient_id uuid not null references auth.users(id) on delete cascade,
 type text not null default 'general', title text not null, message text not null, action_url text,
 entity_type text, entity_id uuid, metadata jsonb not null default '{}', is_read boolean not null default false,
 read_at timestamptz, created_at timestamptz not null default now()
);
create index if not exists notifications_recipient_idx on public.notifications(recipient_id,is_read,created_at desc);

-- ---------------------------------------------------------------------------
-- Creator work, experiences, earnings and payouts. These portal records are
-- linked to canonical projects/experiences/finance rows, never isolated data.
-- ---------------------------------------------------------------------------
create table if not exists public.creator_completed_work(
 id uuid primary key default gen_random_uuid(), creator_id uuid not null references auth.users(id) on delete cascade,
 enterprise_creator_id uuid references public.creator_profiles(id), project_id uuid references public.projects(id),
 contract_id uuid references public.contracts(id), title text not null, client_name text, role text,
 completed_at timestamptz not null default now(), status text not null default 'completed', earnings numeric(14,2) not null default 0,
 currency char(3) not null default 'USD', thumbnail_url text, approved_assets integer not null default 0, created_at timestamptz not null default now()
);
create table if not exists public.creator_experiences(
 id uuid primary key default gen_random_uuid(), creator_id uuid not null references auth.users(id) on delete cascade,
 enterprise_creator_id uuid references public.creator_profiles(id), experience_id uuid references public.experiences(id) on delete cascade,
 title text not null, brand_name text, role text, status text not null default 'upcoming', royalty_percentage numeric(7,4) not null default 0,
 total_plays bigint not null default 0, revenue_generated numeric(14,2) not null default 0, creator_earnings numeric(14,2) not null default 0,
 currency char(3) not null default 'USD', cover_url text, created_at timestamptz not null default now(), unique(creator_id,experience_id,role)
);
create table if not exists public.creator_earnings(
 id uuid primary key default gen_random_uuid(), creator_id uuid not null references auth.users(id) on delete cascade,
 enterprise_creator_id uuid references public.creator_profiles(id), source_line_id uuid unique,
 project_id uuid references public.projects(id), experience_id uuid references public.experiences(id), source text not null,
 project_name text not null, amount numeric(14,2) not null default 0, currency char(3) not null default 'USD',
 status text not null default 'pending', earned_at timestamptz not null default now(), created_at timestamptz not null default now()
);
create table if not exists public.creator_payouts(
 id uuid primary key default gen_random_uuid(), creator_id uuid not null references auth.users(id) on delete cascade,
 enterprise_creator_id uuid references public.creator_profiles(id), payout_batch_id uuid references public.payout_batches(id),
 amount numeric(14,2) not null default 0, currency char(3) not null default 'USD', status text not null default 'pending',
 payout_method text not null default 'stripe', external_reference text, created_at timestamptz not null default now(), paid_at timestamptz
);

-- Normalize the contributor columns used by the current PPR engine.
alter table public.asset_contributors add column if not exists role_name text;
alter table public.asset_contributors add column if not exists contributor_role text;
alter table public.asset_contributors add column if not exists ppr_split numeric(7,4) default 0;
update public.asset_contributors set contributor_role=coalesce(contributor_role,role_name,'Contributor') where contributor_role is null;

-- Populate creator experience projection from registered assets and contributors.
insert into public.creator_experiences(creator_id,enterprise_creator_id,experience_id,title,brand_name,role,status,royalty_percentage,currency)
select distinct cp.user_id,cp.id,a.experience_id,e.title,'Plekxa',ac.contributor_role,
 case when lower(e.status)='active' then 'live' else 'upcoming' end,ac.ppr_split,'USD'
from public.asset_contributors ac join public.creator_profiles cp on cp.id=ac.creator_id
join public.assets a on a.id=ac.asset_id join public.experiences e on e.id=a.experience_id
where cp.user_id is not null and a.experience_id is not null
on conflict(creator_id,experience_id,role) do update set title=excluded.title,status=excluded.status,royalty_percentage=excluded.royalty_percentage;

-- ---------------------------------------------------------------------------
-- Row-level security. Creators can only access their own portal records.
-- Existing Enterprise OS public.is_admin() retains administrator access.
-- ---------------------------------------------------------------------------
do $$ declare t text; begin
 foreach t in array array['profiles','creator_applications','proposals','contracts','contract_milestones','contract_signatures','contract_events','creator_project_workspaces','notifications','creator_completed_work','creator_experiences','creator_earnings','creator_payouts']
 loop execute format('alter table public.%I enable row level security',t); end loop;
end $$;

do $$ begin create policy "creator own profile" on public.profiles for all using(auth.uid()=id) with check(auth.uid()=id); exception when duplicate_object then null; end $$;
do $$ begin create policy "creator read open projects" on public.projects for select using(status in ('open','active','published') or public.is_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "creator own applications" on public.creator_applications for all using(creator_user_id=auth.uid() or public.is_admin()) with check(creator_user_id=auth.uid() or public.is_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "creator own proposals" on public.proposals for all using(creator_user_id=auth.uid() or public.is_admin()) with check(creator_user_id=auth.uid() or public.is_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "creator own contracts" on public.contracts for select using(creator_user_id=auth.uid() or public.is_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "creator contract milestones" on public.contract_milestones for select using(exists(select 1 from public.contracts c where c.id=contract_id and (c.creator_user_id=auth.uid() or public.is_admin()))); exception when duplicate_object then null; end $$;
do $$ begin create policy "creator contract signatures" on public.contract_signatures for select using(exists(select 1 from public.contracts c where c.id=contract_id and (c.creator_user_id=auth.uid() or public.is_admin()))); exception when duplicate_object then null; end $$;
do $$ begin create policy "creator contract events" on public.contract_events for select using(exists(select 1 from public.contracts c where c.id=contract_id and (c.creator_user_id=auth.uid() or public.is_admin()))); exception when duplicate_object then null; end $$;
do $$ begin create policy "creator own workspaces" on public.creator_project_workspaces for select using(creator_id=auth.uid() or public.is_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "creator own notifications" on public.notifications for all using(recipient_id=auth.uid() or public.is_admin()) with check(recipient_id=auth.uid() or public.is_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "creator own completed work" on public.creator_completed_work for select using(creator_id=auth.uid() or public.is_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "creator own experiences" on public.creator_experiences for select using(creator_id=auth.uid() or public.is_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "creator own earnings" on public.creator_earnings for select using(creator_id=auth.uid() or public.is_admin()); exception when duplicate_object then null; end $$;
do $$ begin create policy "creator own payouts" on public.creator_payouts for select using(creator_id=auth.uid() or public.is_admin()); exception when duplicate_object then null; end $$;

-- Grant authenticated users API access; RLS determines which rows are visible.
grant select on public.projects,public.project_opportunities to authenticated;
grant select,insert,update on public.profiles,public.creator_applications,public.proposals,public.notifications to authenticated;
grant select on public.contracts,public.contract_milestones,public.contract_signatures,public.contract_events,public.creator_project_workspaces,public.creator_completed_work,public.creator_experiences,public.creator_earnings,public.creator_payouts to authenticated;
grant execute on function public.withdraw_creator_application(uuid) to authenticated;
grant execute on function public.creator_sign_contract(uuid,text,text,text) to authenticated;
