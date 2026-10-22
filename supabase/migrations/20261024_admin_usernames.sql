-- Admin username login.
-- Adds a unique lowercase username to user_profiles so staff can sign in with
-- a username. The server resolves username -> auth email with the service
-- role; the mapping is never readable by anon clients beyond existing RLS.
-- Existing RLS policies are unchanged.

alter table public.user_profiles
  add column if not exists username text;

alter table public.user_profiles
  drop constraint if exists user_profiles_username_format;
alter table public.user_profiles
  add constraint user_profiles_username_format
  check (username is null or username ~ '^[a-z0-9._-]{3,32}$');

create unique index if not exists user_profiles_username_key
  on public.user_profiles (username)
  where username is not null;

-- Only the service role (server actions / scripts) may set or change a
-- username. Users updating their own profile row cannot claim one.
create or replace function public.guard_user_profile_username()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.username is distinct from old.username
     and coalesce(auth.role(), '') <> 'service_role'
     and current_user not in ('postgres', 'supabase_admin', 'service_role') then
    raise exception 'username can only be changed by an administrator';
  end if;
  return new;
end;
$$;

drop trigger if exists user_profiles_username_guard on public.user_profiles;
create trigger user_profiles_username_guard
  before update of username on public.user_profiles
  for each row execute function public.guard_user_profile_username();

create or replace function public.guard_user_profile_username_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.username is not null
     and coalesce(auth.role(), '') <> 'service_role'
     and current_user not in ('postgres', 'supabase_admin', 'service_role') then
    raise exception 'username can only be set by an administrator';
  end if;
  return new;
end;
$$;

drop trigger if exists user_profiles_username_insert_guard on public.user_profiles;
create trigger user_profiles_username_insert_guard
  before insert on public.user_profiles
  for each row execute function public.guard_user_profile_username_insert();
