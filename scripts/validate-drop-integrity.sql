-- Pre-migration validation for drop_id NOT NULL enforcement.
-- Run against production/staging before applying 20260807150000_drop_id_not_null.sql

-- 1. Products missing drop assignment
select id, name, status, drop_id
from public.products
where drop_id is null
order by created_at desc;

-- 2. Orphan drop references
select p.id, p.name, p.drop_id
from public.products p
left join public.drops d on d.id = p.drop_id
where p.drop_id is not null and d.id is null;

-- 3. Summary counts (expect all zeros before NOT NULL migration)
select
  (select count(*) from public.products where drop_id is null) as products_null_drop_id,
  (
    select count(*)
    from public.products p
    left join public.drops d on d.id = p.drop_id
    where p.drop_id is not null and d.id is null
  ) as products_orphan_drop_id,
  (select count(*) from public.drops) as drop_count,
  (select count(*) from public.products) as product_count;

-- 4. Legacy column sanity (informational — column kept for one release)
select
  count(*) filter (where is_active = true and status <> 'published') as active_but_not_published,
  count(*) filter (where is_active = false and status = 'published') as published_but_inactive
from public.products;
