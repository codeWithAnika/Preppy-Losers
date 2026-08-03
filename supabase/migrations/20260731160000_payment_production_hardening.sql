-- Production payment hardening: sessions, atomic fulfillment, RLS, refund helper.
-- Idempotent — safe to run on databases that partially applied earlier migrations.

-- ---------------------------------------------------------------------------
-- decrement_product_stock (FOR UPDATE row lock)
-- ---------------------------------------------------------------------------
create or replace function public.decrement_product_stock(
  p_product_id text,
  p_size text,
  p_quantity integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  locked_product public.products%rowtype;
  current_stock integer;
begin
  if p_quantity <= 0 then
    return false;
  end if;

  select *
  into locked_product
  from public.products
  where id = p_product_id
  for update;

  if not found then
    return false;
  end if;

  select (elem->>'stock')::integer
  into current_stock
  from jsonb_array_elements(locked_product.size_stock) as elem
  where elem->>'size' = p_size;

  if current_stock is null or current_stock < p_quantity then
    return false;
  end if;

  update public.products
  set size_stock = (
    select coalesce(
      jsonb_agg(
        case
          when elem->>'size' = p_size
          then jsonb_set(
            elem,
            '{stock}',
            to_jsonb((elem->>'stock')::integer - p_quantity)
          )
          else elem
        end
      ),
      '[]'::jsonb
    )
    from jsonb_array_elements(size_stock) as elem
  )
  where id = p_product_id;

  return true;
end;
$$;

revoke all on function public.decrement_product_stock(text, text, integer) from public;
grant execute on function public.decrement_product_stock(text, text, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Multi-item uniqueness + drop legacy single-column index
-- ---------------------------------------------------------------------------
drop index if exists public.orders_razorpay_payment_id_unique;

create unique index if not exists orders_razorpay_payment_line_unique
  on public.orders (razorpay_payment_id, product_id, size)
  where razorpay_payment_id is not null;

-- ---------------------------------------------------------------------------
-- fulfill_paid_order — atomic stock + inserts, advisory lock, rollback on error
-- ---------------------------------------------------------------------------
create or replace function public.fulfill_paid_order(
  p_user_id uuid,
  p_razorpay_order_id text,
  p_razorpay_payment_id text,
  p_shipping_address jsonb,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  v_product_id text;
  v_size text;
  v_quantity integer;
  v_line_amount integer;
  v_stock_ok boolean;
  v_existing_count integer := 0;
  v_expected_count integer;
begin
  if p_razorpay_payment_id is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Invalid fulfillment payload';
  end if;

  v_expected_count := jsonb_array_length(p_items);
  if v_expected_count = 0 then
    raise exception 'Cart is empty';
  end if;

  select count(*)::integer
  into v_existing_count
  from public.orders
  where razorpay_payment_id = p_razorpay_payment_id;

  if v_existing_count >= v_expected_count then
    return jsonb_build_object('ok', true, 'duplicate', true, 'inserted', v_existing_count);
  end if;

  perform pg_advisory_xact_lock(hashtext(p_razorpay_payment_id));

  select count(*)::integer
  into v_existing_count
  from public.orders
  where razorpay_payment_id = p_razorpay_payment_id;

  if v_existing_count >= v_expected_count then
    return jsonb_build_object('ok', true, 'duplicate', true, 'inserted', v_existing_count);
  end if;

  for item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := item->>'product_id';
    v_size := item->>'size';
    v_quantity := (item->>'quantity')::integer;

    if v_product_id is null or v_size is null or v_quantity is null or v_quantity <= 0 then
      raise exception 'Invalid line item';
    end if;

    if exists (
      select 1 from public.orders o
      where o.razorpay_payment_id = p_razorpay_payment_id
        and o.product_id = v_product_id
        and o.size = v_size
    ) then
      continue;
    end if;

    select public.decrement_product_stock(v_product_id, v_size, v_quantity)
    into v_stock_ok;

    if v_stock_ok is distinct from true then
      raise exception 'Insufficient stock for size %', v_size;
    end if;
  end loop;

  for item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := item->>'product_id';
    v_size := item->>'size';
    v_quantity := (item->>'quantity')::integer;
    v_line_amount := (item->>'amount')::integer;

    if exists (
      select 1 from public.orders o
      where o.razorpay_payment_id = p_razorpay_payment_id
        and o.product_id = v_product_id
        and o.size = v_size
    ) then
      continue;
    end if;

    insert into public.orders (
      user_id,
      product_id,
      size,
      quantity,
      amount,
      status,
      razorpay_order_id,
      razorpay_payment_id,
      shipping_address,
      delivery_status
    ) values (
      p_user_id,
      v_product_id,
      v_size,
      v_quantity,
      v_line_amount,
      'paid',
      p_razorpay_order_id,
      p_razorpay_payment_id,
      p_shipping_address,
      'processing'
    );
  end loop;

  return jsonb_build_object('ok', true, 'duplicate', false);
end;
$$;

revoke all on function public.fulfill_paid_order(uuid, text, text, jsonb, jsonb) from public;
grant execute on function public.fulfill_paid_order(uuid, text, text, jsonb, jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- mark_orders_refunded — webhook payment.refunded
-- ---------------------------------------------------------------------------
create or replace function public.mark_orders_refunded(p_razorpay_payment_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated integer;
begin
  if p_razorpay_payment_id is null then
    return 0;
  end if;

  update public.orders
  set status = 'refunded',
      delivery_status = 'cancelled'
  where razorpay_payment_id = p_razorpay_payment_id
    and status = 'paid';

  get diagnostics v_updated = row_count;
  return v_updated;
end;
$$;

revoke all on function public.mark_orders_refunded(text) from public;
grant execute on function public.mark_orders_refunded(text) to service_role;

-- ---------------------------------------------------------------------------
-- payment_sessions — server-side checkout snapshot for verify + webhook
-- ---------------------------------------------------------------------------
create table if not exists public.payment_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  razorpay_order_id text not null,
  items jsonb not null,
  shipping_address jsonb not null,
  amount_paise integer not null check (amount_paise > 0),
  status text not null default 'pending'
    check (status in ('pending', 'fulfilled', 'failed', 'expired')),
  razorpay_payment_id text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  fulfilled_at timestamptz
);

create unique index if not exists payment_sessions_razorpay_order_id_unique
  on public.payment_sessions (razorpay_order_id);

create index if not exists payment_sessions_user_pending_idx
  on public.payment_sessions (user_id, status)
  where status = 'pending';

alter table public.payment_sessions enable row level security;

-- No client policies — only service role via edge functions.

-- ---------------------------------------------------------------------------
-- Orders: users must NOT insert paid orders directly
-- ---------------------------------------------------------------------------
drop policy if exists "Orders: users insert own" on public.orders;

notify pgrst, 'reload schema';
