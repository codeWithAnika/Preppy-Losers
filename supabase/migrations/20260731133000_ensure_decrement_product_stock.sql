-- Ensure decrement_product_stock exists on live DB (may have missed 20260707130000).
-- products.id is text (e.g. drop-02), not uuid.

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

-- Prevent duplicate order rows for the same Razorpay payment id.
create unique index if not exists orders_razorpay_payment_id_unique
  on public.orders (razorpay_payment_id)
  where razorpay_payment_id is not null;

-- Refresh PostgREST schema cache after function create/replace.
notify pgrst, 'reload schema';
