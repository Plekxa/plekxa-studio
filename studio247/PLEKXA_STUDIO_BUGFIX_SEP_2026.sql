-- Creator Studio bug-fix compatibility for proposal submission.
begin;
alter table if exists public.proposals add column if not exists creator_user_id uuid;
alter table if exists public.proposals add column if not exists title text;
alter table if exists public.proposals add column if not exists summary text;
alter table if exists public.proposals add column if not exists description text;
alter table if exists public.proposals add column if not exists department text;
alter table if exists public.proposals add column if not exists format text;
alter table if exists public.proposals add column if not exists estimated_timeline text;
alter table if exists public.proposals add column if not exists estimated_budget numeric(14,2);
alter table if exists public.proposals add column if not exists portfolio_url text;
alter table if exists public.proposals add column if not exists submitted_at timestamptz;
alter table if exists public.proposals add column if not exists status text default 'submitted';
commit;
notify pgrst, 'reload schema';
