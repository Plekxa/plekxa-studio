-- Plekxa Studio -> Enterprise OS creator profile bridge.
-- Run this in the SAME Supabase project used by admin.plekxa.com.

alter table if exists public.creator_profiles
  add column if not exists avatar_url text;

create or replace function public.handle_new_plekxa_creator()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if coalesce(new.raw_user_meta_data ->> 'account_type', '') = 'creator' then
    insert into public.creator_profiles (
      user_id,
      legal_name,
      stage_name,
      email,
      skills,
      genres,
      metadata
    ) values (
      new.id,
      coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
      null,
      new.email,
      array[]::text[],
      array[]::text[],
      jsonb_build_object(
        'creator_type', new.raw_user_meta_data ->> 'creator_type',
        'terms_accepted_at', new.raw_user_meta_data ->> 'terms_accepted_at',
        'source', 'plekxa-studio'
      )
    )
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_plekxa_creator on auth.users;
create trigger on_auth_user_created_create_plekxa_creator
after insert on auth.users
for each row execute procedure public.handle_new_plekxa_creator();

alter table public.creator_profiles enable row level security;

do $$ begin
  create policy "creators can read own enterprise profile"
  on public.creator_profiles for select
  using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "creators can update own enterprise profile"
  on public.creator_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "creators can insert own enterprise profile"
  on public.creator_profiles for insert
  with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
