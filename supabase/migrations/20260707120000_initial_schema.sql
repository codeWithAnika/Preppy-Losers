-- Initial schema: products, profiles, orders, addresses + RLS

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table public.products (
  id text primary key,
  name text not null,
  description text not null,
  price integer not null check (price >= 0),
  size_stock jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  is_active boolean not null default false,
  drop_date date not null,
  accent_color text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null references public.products (id),
  size text not null,
  quantity integer not null check (quantity > 0),
  amount integer not null check (amount >= 0),
  status text not null default 'pending',
  razorpay_order_id text,
  razorpay_payment_id text,
  shipping_address jsonb,
  tracking_id text,
  courier_name text,
  tracking_url text,
  delivery_status text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- addresses
-- ---------------------------------------------------------------------------
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  phone text,
  is_default boolean not null default false
);

-- ---------------------------------------------------------------------------
-- helpers
-- ---------------------------------------------------------------------------
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
  );
$$;

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

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS: profiles
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "Profiles: users read own, admins read all"
  on public.profiles
  for select
  using (auth.uid() = id or public.is_admin());

create policy "Profiles: users insert own"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Profiles: users update own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- RLS: products
-- ---------------------------------------------------------------------------
alter table public.products enable row level security;

create policy "Products: public read"
  on public.products
  for select
  using (true);

create policy "Products: admins insert"
  on public.products
  for insert
  with check (public.is_admin());

create policy "Products: admins update"
  on public.products
  for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Products: admins delete"
  on public.products
  for delete
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- RLS: orders
-- ---------------------------------------------------------------------------
alter table public.orders enable row level security;

create policy "Orders: users read own, admins read all"
  on public.orders
  for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Orders: users insert own"
  on public.orders
  for insert
  with check (auth.uid() = user_id);

create policy "Orders: admins update all"
  on public.orders
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- RLS: addresses
-- ---------------------------------------------------------------------------
alter table public.addresses enable row level security;

create policy "Addresses: users read own"
  on public.addresses
  for select
  using (auth.uid() = user_id);

create policy "Addresses: users insert own"
  on public.addresses
  for insert
  with check (auth.uid() = user_id);

create policy "Addresses: users update own"
  on public.addresses
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Addresses: users delete own"
  on public.addresses
  for delete
  using (auth.uid() = user_id);
