-- drop-02 (HEXED SYSTEM): gallery slots 1–5 (photo1–photo5)

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
