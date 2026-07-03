alter table public.recipes
  alter column ingredients type jsonb using to_jsonb(ingredients);
