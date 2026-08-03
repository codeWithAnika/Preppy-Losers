-- Prevent authenticated users from self-promoting to admin via profiles UPDATE.
-- Admins may still change roles; service_role bypasses via null auth.uid().

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

    if not public.is_admin() then
      new.role := old.role;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_escalation on public.profiles;

create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row
  execute function public.prevent_profile_role_escalation();
