-- Drop 1 (Streetlight Tee): replace placeholder gallery with real product photo.

UPDATE public.products
SET
  images = '["/drop-01.webp"]'::jsonb,
  primary_image = '/drop-01.webp'
WHERE id = 'drop-01';
