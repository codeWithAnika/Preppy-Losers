-- Sync product/drop image paths after /public WebP conversion (2026-07-18).

UPDATE public.products
SET
  images = '[
    "/photo1.webp",
    "/photo2.webp",
    "/photo3.webp",
    "/photo4.webp",
    "/photo5.webp"
  ]'::jsonb,
  primary_image = '/photo1.webp'
WHERE slug = 'hexed-system';

UPDATE public.products
SET
  images = '[
    "/placeholder2.webp",
    "/placeholder1.webp",
    "/placeholder3.webp"
  ]'::jsonb,
  primary_image = '/placeholder2.webp'
WHERE slug = 'drop-01';

UPDATE public.store_settings
SET
  settings = jsonb_set(
    COALESCE(settings, '{}'::jsonb),
    '{logoUrl}',
    '"/logo-badge.webp"'::jsonb,
    true
  ),
  updated_at = now()
WHERE id = 1;
