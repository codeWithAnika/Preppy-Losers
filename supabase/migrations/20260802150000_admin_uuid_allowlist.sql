-- Admin UUID allowlist: only designated auth users may be treated as admin.

create or replace function public.is_allowlisted_admin(p_user_id uuid)
returns boolean
language sql
immutable
as $$
  select p_user_id in (
    '57f4cd74-f557-491f-a283-89b1a7ccdf43'::uuid,
    '8dcc42bf-b7ea-4515-9c4c-767cef5160ac'::uuid
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
      and public.is_allowlisted_admin(id)
  );
$$;

-- Only service_role may change profiles.role (blocks all client self-promotion).
create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if auth.uid() is null then
      return new;
    end if;

    new.role := old.role;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_escalation on public.profiles;

create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row
  execute function public.prevent_profile_role_escalation();
