-- Production integrity: enforce products.drop_id after data verification.
-- Run scripts/validate-drop-integrity.sql first on production.
-- Reversible: ALTER TABLE products ALTER COLUMN drop_id DROP NOT NULL;

-- ---------------------------------------------------------------------------
-- Pre-flight checks (migration fails safely if data is not ready)
-- ---------------------------------------------------------------------------
do $$
declare
  null_drop_count integer;
  orphan_count integer;
begin
  select count(*) into null_drop_count
  from public.products
  where drop_id is null;

  if null_drop_count > 0 then
    raise exception
      'Migration blocked: % product(s) have null drop_id. Assign all products to drops first.',
      null_drop_count;
  end if;

  select count(*) into orphan_count
  from public.products p
  left join public.drops d on d.id = p.drop_id
  where d.id is null;

  if orphan_count > 0 then
    raise exception
      'Migration blocked: % product(s) reference missing drops.',
      orphan_count;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Enforce mandatory drop assignment
-- ---------------------------------------------------------------------------
alter table public.products
  alter column drop_id set not null;

-- ---------------------------------------------------------------------------
-- Status value guards (products + drops)
-- ---------------------------------------------------------------------------
alter table public.products drop constraint if exists products_status_check;
alter table public.products
  add constraint products_status_check
  check (status in ('draft', 'published', 'archived'));

alter table public.drops drop constraint if exists drops_status_check;
alter table public.drops
  add constraint drops_status_check
  check (status in ('draft', 'published', 'archived'));

-- ---------------------------------------------------------------------------
-- ROLLBACK:
-- alter table public.products alter column drop_id drop not null;
-- alter table public.products drop constraint if exists products_status_check;
-- alter table public.drops drop constraint if exists drops_status_check;
