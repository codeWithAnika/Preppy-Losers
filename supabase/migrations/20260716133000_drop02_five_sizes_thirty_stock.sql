-- drop-02 (HEXED SYSTEM): 5 purchasable sizes, 30 units each (XS–XL only)

update public.products
set size_stock = '[
  {"size": "XS", "stock": 30},
  {"size": "S", "stock": 30},
  {"size": "M", "stock": 30},
  {"size": "L", "stock": 30},
  {"size": "XL", "stock": 30}
]'::jsonb
where id = 'drop-02';
