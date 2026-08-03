-- Production index optimizations for common query patterns

-- Orders: user order history (account page)
create index if not exists orders_user_id_created_at_idx
  on public.orders (user_id, created_at desc);

-- Orders: admin order lookup by status
create index if not exists orders_status_created_at_idx
  on public.orders (status, created_at desc);

-- Orders: Razorpay reconciliation
create index if not exists orders_razorpay_order_id_idx
  on public.orders (razorpay_order_id)
  where razorpay_order_id is not null;

-- Products: active drop lookup
create index if not exists products_is_active_drop_date_idx
  on public.products (is_active, drop_date desc);

-- Addresses: default address per user
create index if not exists addresses_user_id_is_default_idx
  on public.addresses (user_id, is_default desc);

-- Profiles: admin role checks
create index if not exists profiles_role_idx
  on public.profiles (role)
  where role = 'admin';

comment on index public.orders_user_id_created_at_idx is
  'Speeds up account order history queries';
