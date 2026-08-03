-- Resolve profiles.email: email lives in auth.users, not public.profiles.
-- Admins read customer emails via a security-definer RPC that joins auth.users.

-- Remove duplicated email column if a prior migration added it
alter table public.profiles
  drop column if exists email;

-- Restore signup trigger without email (profiles.id still references auth.users)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'customer'
  );
  return new;
end;
$$;

-- Admin-only customer list with email from auth.users (no duplication in profiles)
create or replace function public.admin_customer_profiles()
returns table (
  id uuid,
  full_name text,
  email text,
  phone text,
  role text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    p.id,
    p.full_name,
    u.email::text,
    p.phone,
    p.role,
    p.created_at
  from public.profiles p
  inner join auth.users u on u.id = p.id
  where p.role = 'customer'
    and public.is_admin();
$$;

revoke all on function public.admin_customer_profiles() from public;
grant execute on function public.admin_customer_profiles() to authenticated;
