alter table public.recipes
  alter column meal_type type text[]
  using case when meal_type is null then null else array[meal_type] end;
