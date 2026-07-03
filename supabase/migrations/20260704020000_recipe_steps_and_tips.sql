alter table public.recipes
  alter column instructions type text[] using string_to_array(instructions, E'\n');

alter table public.recipes
  add column tips text;
