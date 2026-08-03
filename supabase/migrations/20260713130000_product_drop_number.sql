-- drop_number labels (Drop 1 / Drop 2) + final two-product state

alter table public.products
  add column if not exists drop_number integer check (drop_number > 0);

update public.products
set drop_number = 1
where id = 'drop-01';

update public.products
set
  drop_number = 2,
  name = 'HEXED SYSTEM',
  description = 'Engineered for the streets.',
  price = 859,
  details = E'260 GSM Heavyweight Cotton
100% Cotton Fabric
Premium Screen Print
Crop Boxy Fit',
  images = '[
    "/product-placeholder.webp",
    "/photo2.webp",
    "/photo3.webp",
    "/photo4.webp",
    "/photo5.webp"
  ]'::jsonb,
  size_stock = '[
    {"size": "XS", "stock": 5},
    {"size": "S", "stock": 5},
    {"size": "M", "stock": 5},
    {"size": "L", "stock": 5},
    {"size": "XL", "stock": 5},
    {"size": "2XL", "stock": 5},
    {"size": "3XL", "stock": 5}
  ]'::jsonb,
  is_active = true,
  drop_date = '2026-03-15',
  accent_color = '#8b1e1e'
where id = 'drop-02';

update public.products
set
  drop_number = 1,
  name = 'Streetlight Tee',
  description = 'Midweight 240gsm cotton jersey in vintage wash. Boxy cut, screen-printed back graphic, pre-shrunk. The first drop — gone in forty-eight hours.',
  details = null,
  price = 45,
  size_stock = '[
    {"size": "S", "stock": 0},
    {"size": "M", "stock": 0},
    {"size": "L", "stock": 0},
    {"size": "XL", "stock": 0}
  ]'::jsonb,
  images = '[
    "/placeholder2.webp",
    "/placeholder1.webp",
    "/placeholder3.webp"
  ]'::jsonb,
  is_active = false,
  drop_date = '2025-11-08',
  accent_color = null
where id = 'drop-01';

delete from public.products
where id not in ('drop-01', 'drop-02');

delete from public.products where id = 'drop-03';
