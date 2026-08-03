-- Active drop gallery: 4 real photos + 1 placeholder slot (5 total).
-- Bootstrap drop-02 so later migrations (and fresh db reset) are not no-ops.

insert into public.products (
  id,
  name,
  description,
  price,
  size_stock,
  images,
  is_active,
  drop_date,
  accent_color
)
values (
  'drop-02',
  'HEXED SYSTEM',
  'Engineered for the streets.',
  859,
  '[]'::jsonb,
  '[]'::jsonb,
  true,
  '2026-03-15',
  '#8b1e1e'
)
on conflict (id) do nothing;

update public.products
set images = '[
  "/product-placeholder.webp",
  "/photo2.webp",
  "/photo3.webp",
  "/photo4.webp",
  "/photo5.webp"
]'::jsonb
where id = 'drop-02'
  and is_active = true;
