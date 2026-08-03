-- drop-01 = sold-out archive; drop-02 = live with stock

update public.products
set
  is_active = false,
  size_stock = '[
    {"size": "S", "stock": 0},
    {"size": "M", "stock": 0},
    {"size": "L", "stock": 0},
    {"size": "XL", "stock": 0}
  ]'::jsonb
where id = 'drop-01';

insert into public.products (
  id,
  name,
  description,
  details,
  price,
  size_stock,
  images,
  is_active,
  drop_date,
  accent_color
)
values (
  'drop-01',
  'Streetlight Tee',
  'Midweight 240gsm cotton jersey in vintage wash. Boxy cut, screen-printed back graphic, pre-shrunk. The first drop — gone in forty-eight hours.',
  null,
  45,
  '[
    {"size": "S", "stock": 0},
    {"size": "M", "stock": 0},
    {"size": "L", "stock": 0},
    {"size": "XL", "stock": 0}
  ]'::jsonb,
  '[
    "/placeholder2.webp",
    "/placeholder1.webp",
    "/placeholder3.webp"
  ]'::jsonb,
  false,
  '2025-11-08',
  null
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  size_stock = excluded.size_stock,
  images = excluded.images,
  is_active = false,
  drop_date = excluded.drop_date;

update public.products
set
  is_active = true,
  drop_date = '2026-03-15',
  accent_color = '#8b1e1e',
  size_stock = '[
    {"size": "XS", "stock": 5},
    {"size": "S", "stock": 5},
    {"size": "M", "stock": 5},
    {"size": "L", "stock": 5},
    {"size": "XL", "stock": 5},
    {"size": "2XL", "stock": 5},
    {"size": "3XL", "stock": 5}
  ]'::jsonb
where id = 'drop-02';
