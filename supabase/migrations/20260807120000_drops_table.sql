-- Drop Management System: drops are collections; products belong to drops.
-- Migrates existing drop_number groupings into drops rows without data loss.

-- ---------------------------------------------------------------------------
-- drops table
-- ---------------------------------------------------------------------------
create table if not exists public.drops (
  id uuid primary key default gen_random_uuid(),
  drop_number integer not null,
  name text not null,
  slug text not null,
  description text,
  hero_image text,
  banner_image text,
  launch_date date not null,
  is_active boolean not null default false,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint drops_drop_number_unique unique (drop_number),
  constraint drops_slug_unique unique (slug)
);

create index if not exists drops_is_active_launch_date_idx
  on public.drops (is_active, launch_date desc);

create index if not exists drops_status_idx
  on public.drops (status);

-- ---------------------------------------------------------------------------
-- products.drop_id FK
-- ---------------------------------------------------------------------------
alter table public.products
  add column if not exists drop_id uuid references public.drops (id) on delete set null;

create index if not exists products_drop_id_idx
  on public.products (drop_id);

-- ---------------------------------------------------------------------------
-- Backfill drops from existing products grouped by drop_number
-- ---------------------------------------------------------------------------
insert into public.drops (
  drop_number,
  name,
  slug,
  description,
  hero_image,
  banner_image,
  launch_date,
  is_active,
  status,
  seo_title,
  seo_description,
  created_at,
  updated_at
)
select
  g.drop_number,
  coalesce(
    (
      select p.name
      from public.products p
      where p.drop_number = g.drop_number
      order by p.is_active desc, p.featured desc nulls last, p.created_at desc
      limit 1
    ),
    'Drop ' || lpad(g.drop_number::text, 2, '0')
  ) as name,
  coalesce(
    (
      select p.slug
      from public.products p
      where p.drop_number = g.drop_number
      order by p.is_active desc, p.featured desc nulls last, p.created_at desc
      limit 1
    ),
    'drop-' || lpad(g.drop_number::text, 2, '0')
  ) as slug,
  (
    select p.description
    from public.products p
    where p.drop_number = g.drop_number
    order by p.is_active desc, p.featured desc nulls last, p.created_at desc
    limit 1
  ) as description,
  (
    select coalesce(p.primary_image, p.images->>0)
    from public.products p
    where p.drop_number = g.drop_number
    order by p.is_active desc, p.featured desc nulls last, p.created_at desc
    limit 1
  ) as hero_image,
  (
    select p.images->>1
    from public.products p
    where p.drop_number = g.drop_number
    order by p.is_active desc, p.featured desc nulls last, p.created_at desc
    limit 1
  ) as banner_image,
  (
    select max(p.drop_date)
    from public.products p
    where p.drop_number = g.drop_number
  ) as launch_date,
  exists (
    select 1
    from public.products p
    where p.drop_number = g.drop_number
      and p.is_active = true
  ) as is_active,
  case
    when exists (
      select 1 from public.products p
      where p.drop_number = g.drop_number and p.is_active = true
    ) then 'published'
    when exists (
      select 1 from public.products p
      where p.drop_number = g.drop_number and p.status = 'archived'
    ) then 'archived'
    else 'draft'
  end as status,
  (
    select p.seo_title
    from public.products p
    where p.drop_number = g.drop_number
    order by p.is_active desc, p.featured desc nulls last, p.created_at desc
    limit 1
  ) as seo_title,
  (
    select p.seo_description
    from public.products p
    where p.drop_number = g.drop_number
    order by p.is_active desc, p.featured desc nulls last, p.created_at desc
    limit 1
  ) as seo_description,
  (
    select min(p.created_at)
    from public.products p
    where p.drop_number = g.drop_number
  ) as created_at,
  now() as updated_at
from (
  select distinct drop_number
  from public.products
  where drop_number is not null
) as g
on conflict (drop_number) do nothing;

-- Products with null drop_number: assign to individually numbered legacy drops
do $$
declare
  rec record;
  next_num integer;
  new_drop_id uuid;
begin
  select coalesce(max(drop_number), 0) + 1 into next_num from public.drops;

  for rec in
    select p.*
    from public.products p
    where p.drop_number is null
      and p.drop_id is null
  loop
    insert into public.drops (
      drop_number,
      name,
      slug,
      description,
      hero_image,
      launch_date,
      is_active,
      status,
      created_at,
      updated_at
    )
    values (
      next_num,
      rec.name,
      coalesce(rec.slug, rec.id),
      rec.description,
      coalesce(rec.primary_image, rec.images->>0),
      rec.drop_date,
      rec.is_active,
      case rec.status
        when 'published' then 'published'
        when 'archived' then 'archived'
        else 'draft'
      end,
      rec.created_at,
      now()
    )
    returning id into new_drop_id;

    update public.products
    set drop_id = new_drop_id,
        drop_number = next_num
    where id = rec.id;

    next_num := next_num + 1;
  end loop;
end $$;

-- Link products to their drop rows
update public.products p
set drop_id = d.id
from public.drops d
where p.drop_number = d.drop_number
  and p.drop_id is null;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.drops enable row level security;

drop policy if exists "Drops: public read" on public.drops;
create policy "Drops: public read"
  on public.drops
  for select
  using (true);

drop policy if exists "Drops: admins insert" on public.drops;
create policy "Drops: admins insert"
  on public.drops
  for insert
  with check (public.is_admin());

drop policy if exists "Drops: admins update" on public.drops;
create policy "Drops: admins update"
  on public.drops
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Drops: admins delete" on public.drops;
create policy "Drops: admins delete"
  on public.drops
  for delete
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_drops_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists drops_set_updated_at on public.drops;
create trigger drops_set_updated_at
  before update on public.drops
  for each row
  execute function public.set_drops_updated_at();
