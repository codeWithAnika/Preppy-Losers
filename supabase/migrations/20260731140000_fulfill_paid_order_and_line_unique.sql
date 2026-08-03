-- Fix multi-line-item orders: one razorpay_payment_id maps to multiple order rows.
-- Replace single-column unique index with per-line uniqueness.

drop index if exists public.orders_razorpay_payment_id_unique;

create unique index if not exists orders_razorpay_payment_line_unique
  on public.orders (razorpay_payment_id, product_id, size)
  where razorpay_payment_id is not null;

-- Atomic post-payment fulfillment: validate all lines, then stock + inserts in one transaction.
-- Raises on failure so partial commits cannot occur.
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

  -- Serialize concurrent verify calls for the same Razorpay payment.
  perform pg_advisory_xact_lock(hashtext(p_razorpay_payment_id));

  select count(*)::integer
  into v_existing_count
  from public.orders
  where razorpay_payment_id = p_razorpay_payment_id;

  if v_existing_count >= v_expected_count then
    return jsonb_build_object('ok', true, 'duplicate', true, 'inserted', v_existing_count);
  end if;

  -- Pass 1: validate payload and remaining stock for lines not yet inserted.
  for item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := item->>'product_id';
    v_size := item->>'size';
    v_quantity := (item->>'quantity')::integer;

    if v_product_id is null or v_size is null or v_quantity is null or v_quantity <= 0 then
      raise exception 'Invalid line item';
    end if;

    if exists (
      select 1
      from public.orders o
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

  -- Pass 2: insert any missing order rows (stock already decremented in pass 1).
  for item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := item->>'product_id';
    v_size := item->>'size';
    v_quantity := (item->>'quantity')::integer;
    v_line_amount := (item->>'amount')::integer;

    if exists (
      select 1
      from public.orders o
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
exception
  when others then
    raise;
end;
$$;

revoke all on function public.fulfill_paid_order(uuid, text, text, jsonb, jsonb) from public;
grant execute on function public.fulfill_paid_order(uuid, text, text, jsonb, jsonb) to service_role;

notify pgrst, 'reload schema';
