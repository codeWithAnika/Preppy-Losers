-- Customer saved addresses (multi-address support with RLS)

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  phone text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text not null,
  pincode text not null,
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_addresses_user_id_idx
  on public.customer_addresses (user_id);

create index if not exists customer_addresses_user_default_idx
  on public.customer_addresses (user_id, is_default desc);

-- Migrate legacy single-address rows if present
insert into public.customer_addresses (
  user_id,
  full_name,
  phone,
  address_line_1,
  address_line_2,
  city,
  state,
  pincode,
  country,
  is_default,
  created_at,
  updated_at
)
select
  a.user_id,
  coalesce(nullif(trim(p.full_name), ''), 'Customer'),
  coalesce(nullif(trim(a.phone), ''), '0000000000'),
  a.line1,
  a.line2,
  a.city,
  a.state,
  a.pincode,
  'India',
  a.is_default,
  now(),
  now()
from public.addresses a
left join public.profiles p on p.id = a.user_id
where not exists (
  select 1
  from public.customer_addresses ca
  where ca.user_id = a.user_id
    and ca.address_line_1 = a.line1
    and ca.pincode = a.pincode
);

create or replace function public.set_customer_address_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customer_addresses_updated_at on public.customer_addresses;
create trigger customer_addresses_updated_at
  before update on public.customer_addresses
  for each row
  execute function public.set_customer_address_updated_at();

create or replace function public.ensure_single_default_customer_address()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_default then
    update public.customer_addresses
    set is_default = false
    where user_id = new.user_id
      and id <> new.id
      and is_default = true;
  end if;
  return new;
end;
$$;

drop trigger if exists customer_addresses_single_default on public.customer_addresses;
create trigger customer_addresses_single_default
  after insert or update of is_default on public.customer_addresses
  for each row
  when (new.is_default)
  execute function public.ensure_single_default_customer_address();

alter table public.customer_addresses enable row level security;

drop policy if exists "Customer addresses: users read own" on public.customer_addresses;
create policy "Customer addresses: users read own"
  on public.customer_addresses
  for select
  using (auth.uid() = user_id);

drop policy if exists "Customer addresses: users insert own" on public.customer_addresses;
create policy "Customer addresses: users insert own"
  on public.customer_addresses
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Customer addresses: users update own" on public.customer_addresses;
create policy "Customer addresses: users update own"
  on public.customer_addresses
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Customer addresses: users delete own" on public.customer_addresses;
create policy "Customer addresses: users delete own"
  on public.customer_addresses
  for delete
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.customer_addresses to authenticated;
