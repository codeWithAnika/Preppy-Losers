-- HEXED SYSTEM (drop-02): 7 purchasable sizes with placeholder stock

update public.products
set size_stock = '[
  {"size": "XS", "stock": 5},
  {"size": "S", "stock": 5},
  {"size": "M", "stock": 5},
  {"size": "L", "stock": 5},
  {"size": "XL", "stock": 5},
  {"size": "2XL", "stock": 5},
  {"size": "3XL", "stock": 5}
]'::jsonb
where id = 'drop-02'
  and is_active = true;
