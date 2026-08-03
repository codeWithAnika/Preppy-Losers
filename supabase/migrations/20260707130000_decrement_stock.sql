-- Atomic stock decrement for post-payment fulfillment

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
  current_stock integer;
begin
  if p_quantity <= 0 then
    return false;
  end if;

  select (elem->>'stock')::integer
  into current_stock
  from public.products,
       jsonb_array_elements(size_stock) as elem
  where products.id = p_product_id
    and elem->>'size' = p_size;

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
