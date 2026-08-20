-- Caches machine-translated recipe content per locale so we only call the
-- translation API once per recipe/locale pair, not on every page view.
alter table public.recipes
  add column translations jsonb not null default '{}'::jsonb;
