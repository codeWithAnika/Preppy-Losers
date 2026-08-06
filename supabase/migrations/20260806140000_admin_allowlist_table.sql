-- Database-backed admin allowlist (replaces hardcoded UUID arrays in code and SQL).

create table if not exists public.admin_allowlist (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.admin_allowlist is
  'Users permitted to hold admin access. Dual gate with profiles.role = admin.';

-- Seed existing admins from the previous hardcoded allowlist.
insert into public.admin_allowlist (user_id)
values
  ('57f4cd74-f557-491f-a283-89b1a7ccdf43'::uuid),
  ('8dcc42bf-b7ea-4515-9c4c-767cef5160ac'::uuid)
on conflict (user_id) do nothing;

alter table public.admin_allowlist enable row level security;

drop policy if exists "Admin allowlist: users read own" on public.admin_allowlist;
create policy "Admin allowlist: users read own"
  on public.admin_allowlist
  for select
  using (auth.uid() = user_id);

-- Replace parameterized hardcoded function with auth.uid() lookup.
drop function if exists public.is_allowlisted_admin(uuid);

create or replace function public.is_allowlisted_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_allowlist
    where user_id = auth.uid()
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
  and public.is_allowlisted_admin();
$$;

-- Grant admin: allowlist row + profiles.role (service_role / SQL editor only).
create or replace function public.grant_admin(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is null then
    raise exception 'user_id is required';
  end if;

  insert into public.admin_allowlist (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  update public.profiles
  set role = 'admin'
  where id = p_user_id;

  if not found then
    raise exception 'Profile not found for user %', p_user_id;
  end if;
end;
$$;

create or replace function public.revoke_admin(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is null then
    raise exception 'user_id is required';
  end if;

  delete from public.admin_allowlist
  where user_id = p_user_id;

  update public.profiles
  set role = 'customer'
  where id = p_user_id;
end;
$$;

revoke all on function public.is_allowlisted_admin() from public;
grant execute on function public.is_allowlisted_admin() to authenticated;

revoke all on function public.grant_admin(uuid) from public;
grant execute on function public.grant_admin(uuid) to service_role;

revoke all on function public.revoke_admin(uuid) from public;
grant execute on function public.revoke_admin(uuid) to service_role;

create index if not exists admin_allowlist_user_id_idx
  on public.admin_allowlist (user_id);
