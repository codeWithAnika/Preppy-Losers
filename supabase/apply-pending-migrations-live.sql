-- =============================================================================
-- Apply pending migrations to LIVE Supabase (from 20260715120000 onward)
-- Run once in: Supabase Dashboard → SQL Editor
--
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT / DROP POLICY IF EXISTS
-- Your live DB already has drop-01 + drop-02 with correct catalog data;
-- sections marked "data sync" are idempotent no-ops if already applied.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 20260715120000_admin_extensions.sql
-- ---------------------------------------------------------------------------

alter table public.products
  add column if not exists slug text,
  add column if not exists featured boolean not null default false,
  add column if not exists primary_image text,
  add column if not exists category text,
  add column if not exists weight_grams integer check (weight_grams is null or weight_grams >= 0),
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists status text not null default 'published'
    check (status in ('draft', 'published', 'archived')),
  add column if not exists updated_at timestamptz not null default now();

update public.products
set
  slug = coalesce(slug, id),
  primary_image = coalesce(
    primary_image,
    case
      when jsonb_array_length(images) > 0 then images->>0
      else null
    end
  ),
  updated_at = coalesce(updated_at, created_at)
where slug is null or primary_image is null;

update public.products
set status = case when is_active then 'published' else 'archived' end;

create table if not exists public.store_settings (
  id integer primary key default 1 check (id = 1),
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id, settings)
values (
  1,
  '{
    "storeName": "Preppy Losers",
    "supportEmail": "Loserspreppy@gmail.com",
    "shippingNote": "Ships within 5–7 business days via tracked courier.",
    "taxRate": 0,
    "socialLinks": {
      "instagram": "https://www.instagram.com/preppylosers",
      "threads": "https://threads.net"
    },
    "logoUrl": "/logo-badge.webp",
    "faviconUrl": "/favicon.ico"
  }'::jsonb
)
on conflict (id) do nothing;

alter table public.store_settings enable row level security;

drop policy if exists "Store settings: public read" on public.store_settings;
create policy "Store settings: public read"
  on public.store_settings
  for select
  using (true);

drop policy if exists "Store settings: admins update" on public.store_settings;
create policy "Store settings: admins update"
  on public.store_settings
  for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Addresses: admins read all" on public.addresses;
create policy "Addresses: admins read all"
  on public.addresses
  for select
  using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-media',
  'product-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do nothing;

drop policy if exists "Product media: public read" on storage.objects;
create policy "Product media: public read"
  on storage.objects
  for select
  using (bucket_id = 'product-media');

drop policy if exists "Product media: admins upload" on storage.objects;
create policy "Product media: admins upload"
  on storage.objects
  for insert
  with check (bucket_id = 'product-media' and public.is_admin());

drop policy if exists "Product media: admins update" on storage.objects;
create policy "Product media: admins update"
  on storage.objects
  for update
  using (bucket_id = 'product-media' and public.is_admin())
  with check (bucket_id = 'product-media' and public.is_admin());

drop policy if exists "Product media: admins delete" on storage.objects;
create policy "Product media: admins delete"
  on storage.objects
  for delete
  using (bucket_id = 'product-media' and public.is_admin());

-- ---------------------------------------------------------------------------
-- 20260715130000_profile_email_from_auth.sql
-- ---------------------------------------------------------------------------

alter table public.profiles
  drop column if exists email;

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

create or replace function public.admin_customer_profiles()
returns table (
  id uuid,
  full_name text,
  email text,
  phone text,
  role text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    p.id,
    p.full_name,
    u.email::text,
    p.phone,
    p.role,
    p.created_at
  from public.profiles p
  inner join auth.users u on u.id = p.id
  where p.role = 'customer'
    and public.is_admin();
$$;

revoke all on function public.admin_customer_profiles() from public;
grant execute on function public.admin_customer_profiles() to authenticated;

-- ---------------------------------------------------------------------------
-- 20260716133000_drop02_five_sizes_thirty_stock.sql  (data sync)
-- ---------------------------------------------------------------------------

update public.products
set size_stock = '[
  {"size": "XS", "stock": 30},
  {"size": "S", "stock": 30},
  {"size": "M", "stock": 30},
  {"size": "L", "stock": 30},
  {"size": "XL", "stock": 30}
]'::jsonb
where id = 'drop-02';

-- ---------------------------------------------------------------------------
-- 20260718140000_drop02_gallery_photo1_to_photo5.sql  (data sync)
-- ---------------------------------------------------------------------------

update public.products
set
  images = '[
    "/photo1.webp",
    "/photo2.webp",
    "/photo3.webp",
    "/photo4.webp",
    "/photo5.webp"
  ]'::jsonb,
  primary_image = '/photo1.webp'
where id = 'drop-02';

-- ---------------------------------------------------------------------------
-- 20260718150000_public_images_webp.sql  (data sync after /public WebP conversion)
-- ---------------------------------------------------------------------------

update public.products
set
  images = '[
    "/photo1.webp",
    "/photo2.webp",
    "/photo3.webp",
    "/photo4.webp",
    "/photo5.webp"
  ]'::jsonb,
  primary_image = '/photo1.webp'
where slug = 'hexed-system';

update public.products
set
  images = '[
    "/placeholder2.webp",
    "/placeholder1.webp",
    "/placeholder3.webp"
  ]'::jsonb,
  primary_image = '/placeholder2.webp'
where slug = 'drop-01';

update public.store_settings
set
  settings = jsonb_set(
    coalesce(settings, '{}'::jsonb),
    '{logoUrl}',
    '"/logo-badge.webp"'::jsonb,
    true
  ),
  updated_at = now()
where id = 1;

-- Ensure admin metadata is fully populated after gallery sync
update public.products
set
  slug = coalesce(slug, id),
  primary_image = coalesce(primary_image, images->>0),
  status = case when is_active then 'published' else 'archived' end,
  updated_at = now()
where id in ('drop-01', 'drop-02');

-- ---------------------------------------------------------------------------
-- Verification (optional — review output, no writes)
-- ---------------------------------------------------------------------------

select id, name, is_active, slug, primary_image, status, drop_number
from public.products
order by drop_number;

select id, settings->>'storeName' as store_name
from public.store_settings;

select id, name, public
from storage.buckets
where id = 'product-media';

-- ---------------------------------------------------------------------------
-- 20260731133000_ensure_decrement_product_stock.sql
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

create unique index if not exists orders_razorpay_payment_id_unique
  on public.orders (razorpay_payment_id)
  where razorpay_payment_id is not null;

notify pgrst, 'reload schema';
