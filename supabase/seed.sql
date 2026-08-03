-- Final two-product seed: drop-01 (Drop 1 / Streetlight Tee), drop-02 (Drop 2 / HEXED SYSTEM)



insert into public.products (

  id,

  drop_number,

  name,

  description,

  details,

  price,

  size_stock,

  images,

  is_active,

  drop_date,

  accent_color,

  slug,

  primary_image,

  status

)

values

  (

    'drop-02',

    2,

    'HEXED SYSTEM',

    'Engineered for the streets.',

    E'260 GSM Heavyweight Cotton

100% Cotton Fabric

Premium Screen Print

Crop Boxy Fit',

    859,

    '[

      {"size": "XS", "stock": 30},

      {"size": "S", "stock": 30},

      {"size": "M", "stock": 30},

      {"size": "L", "stock": 30},

      {"size": "XL", "stock": 30}

    ]'::jsonb,

    '[

      "/photo1.webp",

      "/photo2.webp",

      "/photo3.webp",

      "/photo4.webp",

      "/photo5.webp"

    ]'::jsonb,

    true,

    '2026-03-15',

    '#8b1e1e',

    'drop-02',

    '/photo1.webp',

    'published'

  ),

  (

    'drop-01',

    1,

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

      "/drop-01.webp"

    ]'::jsonb,

    false,

    '2025-11-08',

    null,

    'drop-01',

    '/drop-01.webp',

    'archived'

  )

on conflict (id) do update set

  drop_number = excluded.drop_number,

  name = excluded.name,

  description = excluded.description,

  details = excluded.details,

  price = excluded.price,

  size_stock = excluded.size_stock,

  images = excluded.images,

  is_active = excluded.is_active,

  drop_date = excluded.drop_date,

  accent_color = excluded.accent_color,

  slug = excluded.slug,

  primary_image = excluded.primary_image,

  status = excluded.status;



delete from public.products where id not in ('drop-01', 'drop-02');

