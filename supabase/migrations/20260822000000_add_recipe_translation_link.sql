alter table public.recipes
  add column translation_of uuid references public.recipes(id) on delete set null;
