-- Split profiles SELECT into own-row + admin policies (avoids OR + is_admin() edge cases).

drop policy if exists "Profiles: users read own, admins read all" on public.profiles;

drop policy if exists "Profiles: users read own" on public.profiles;
create policy "Profiles: users read own"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Profiles: admins read all" on public.profiles;
create policy "Profiles: admins read all"
  on public.profiles
  for select
  using (public.is_admin());
