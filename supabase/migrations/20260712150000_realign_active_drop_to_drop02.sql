-- Realign drop ids: drop-02 is the active drop (HEXED SYSTEM); drop-03 is legacy.

update public.products
set
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
  is_active = true
where id = 'drop-02';

delete from public.products where id = 'drop-03';
