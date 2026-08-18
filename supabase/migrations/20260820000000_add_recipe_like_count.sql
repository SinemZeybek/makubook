alter table public.recipes
  add column like_count integer not null default 0;

create or replace function public.handle_favorite_insert()
returns trigger as $$
begin
  update public.recipes set like_count = like_count + 1 where id = new.recipe_id;
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.handle_favorite_delete()
returns trigger as $$
begin
  update public.recipes set like_count = greatest(like_count - 1, 0) where id = old.recipe_id;
  return old;
end;
$$ language plpgsql security definer;

create trigger on_favorite_insert
  after insert on public.favorites
  for each row execute function public.handle_favorite_insert();

create trigger on_favorite_delete
  after delete on public.favorites
  for each row execute function public.handle_favorite_delete();
