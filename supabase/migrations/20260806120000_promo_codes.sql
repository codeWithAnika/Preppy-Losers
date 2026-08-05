-- Promo codes + checkout/order promo metadata

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  type text not null check (type in ('percentage', 'fixed')),
  value numeric not null check (value > 0),
  minimum_order numeric not null default 0 check (minimum_order >= 0),
  maximum_discount numeric check (maximum_discount is null or maximum_discount > 0),
  max_uses integer check (max_uses is null or max_uses > 0),
  used_count integer not null default 0 check (used_count >= 0),
  active boolean not null default true,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  constraint promo_codes_date_range check (
    starts_at is null or expires_at is null or starts_at <= expires_at
  )
);

create index if not exists promo_codes_code_upper_idx
  on public.promo_codes (upper(code));

create index if not exists promo_codes_active_idx
  on public.promo_codes (active)
  where active = true;

alter table public.promo_codes enable row level security;

drop policy if exists "Promo codes: admins manage" on public.promo_codes;
create policy "Promo codes: admins manage"
  on public.promo_codes
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- payment_sessions: store validated promo snapshot at checkout creation
alter table public.payment_sessions
  add column if not exists promo_code text,
  add column if not exists subtotal_paise integer,
  add column if not exists discount_paise integer not null default 0;

update public.payment_sessions
set subtotal_paise = amount_paise
where subtotal_paise is null;

alter table public.payment_sessions
  alter column subtotal_paise set not null;

-- orders: promo metadata (duplicated per line item for the same payment)
alter table public.orders
  add column if not exists promo_code text,
  add column if not exists discount_amount integer not null default 0,
  add column if not exists original_subtotal integer,
  add column if not exists final_total integer;

-- Atomically increment promo usage after successful payment (service role only)
create or replace function public.increment_promo_used_count(p_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows integer;
begin
  if p_code is null or trim(p_code) = '' then
    return false;
  end if;

  update public.promo_codes
  set used_count = used_count + 1
  where upper(code) = upper(trim(p_code))
    and active = true
    and (max_uses is null or used_count < max_uses);

  get diagnostics v_rows = row_count;
  return v_rows > 0;
end;
$$;

revoke all on function public.increment_promo_used_count(text) from public;
grant execute on function public.increment_promo_used_count(text) to service_role;

-- Extend fulfill_paid_order to persist promo fields on each order line
create or replace function public.fulfill_paid_order(
  p_user_id uuid,
  p_razorpay_order_id text,
  p_razorpay_payment_id text,
  p_shipping_address jsonb,
  p_items jsonb,
  p_promo_code text default null,
  p_discount_amount integer default 0,
  p_original_subtotal integer default null,
  p_final_total integer default null
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
      delivery_status,
      promo_code,
      discount_amount,
      original_subtotal,
      final_total
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
      'processing',
      nullif(trim(p_promo_code), ''),
      coalesce(p_discount_amount, 0),
      p_original_subtotal,
      p_final_total
    );
  end loop;

  return jsonb_build_object('ok', true, 'duplicate', false);
end;
$$;

revoke all on function public.fulfill_paid_order(uuid, text, text, jsonb, jsonb, text, integer, integer, integer) from public;
grant execute on function public.fulfill_paid_order(uuid, text, text, jsonb, jsonb, text, integer, integer, integer) to service_role;

notify pgrst, 'reload schema';
