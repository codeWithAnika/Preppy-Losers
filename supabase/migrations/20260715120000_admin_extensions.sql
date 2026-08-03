-- Admin dashboard extensions: product metadata, store settings, storage

-- ---------------------------------------------------------------------------
-- products: extended admin fields (gallery maps to existing images jsonb)
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

-- ---------------------------------------------------------------------------
-- store settings (single-row config, not duplicating catalog tables)
-- ---------------------------------------------------------------------------
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

create policy "Store settings: public read"
  on public.store_settings
  for select
  using (true);

create policy "Store settings: admins update"
  on public.store_settings
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- addresses: admins can read for customer support
-- ---------------------------------------------------------------------------
create policy "Addresses: admins read all"
  on public.addresses
  for select
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- storage: product-media bucket
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-media',
  'product-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do nothing;

create policy "Product media: public read"
  on storage.objects
  for select
  using (bucket_id = 'product-media');

create policy "Product media: admins upload"
  on storage.objects
  for insert
  with check (bucket_id = 'product-media' and public.is_admin());

create policy "Product media: admins update"
  on storage.objects
  for update
  using (bucket_id = 'product-media' and public.is_admin())
  with check (bucket_id = 'product-media' and public.is_admin());

create policy "Product media: admins delete"
  on storage.objects
  for delete
  using (bucket_id = 'product-media' and public.is_admin());
