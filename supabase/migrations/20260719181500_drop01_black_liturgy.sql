-- Drop 1 (BLACK LITURGY): real archived product details + hero image.

UPDATE public.products
SET
  name = 'BLACK LITURGY',
  price = 1299,
  details = E'240 GSM Heavyweight Cotton\r\n100% Cotton Fabric\r\nPremium Screen Print & Stone washed\r\nCrop Boxy Fit',
  description = '240gsm heavyweight cotton in stone wash. Boxy crop fit with premium screen print. The first drop — sold out.',
  images = '["/drop-01.webp"]'::jsonb,
  primary_image = '/drop-01.webp',
  updated_at = now()
WHERE id = 'drop-01';
