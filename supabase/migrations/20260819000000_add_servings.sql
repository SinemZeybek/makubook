alter table public.recipes
  add column servings integer not null default 1 check (servings > 0);
