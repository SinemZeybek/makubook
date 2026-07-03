-- profiles: extends auth.users with app-specific fields
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_language text not null default 'fi' check (preferred_language in ('fi', 'en')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- auto-create a profile row whenever a new user signs up
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- recipes
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  ingredients text not null,
  instructions text not null,
  language text not null check (language in ('fi', 'en')),
  created_at timestamptz not null default now()
);

alter table public.recipes enable row level security;

create policy "Recipes are viewable by everyone"
  on public.recipes for select
  using (true);

create policy "Users can insert their own recipes"
  on public.recipes for insert
  with check (auth.uid() = author_id);

create policy "Users can update their own recipes"
  on public.recipes for update
  using (auth.uid() = author_id);

create policy "Users can delete their own recipes"
  on public.recipes for delete
  using (auth.uid() = author_id);

-- recipe_images
create table public.recipe_images (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now()
);

alter table public.recipe_images enable row level security;

create policy "Recipe images are viewable by everyone"
  on public.recipe_images for select
  using (true);

create policy "Users can add images to their own recipes"
  on public.recipe_images for insert
  with check (
    exists (
      select 1 from public.recipes
      where recipes.id = recipe_images.recipe_id
      and recipes.author_id = auth.uid()
    )
  );

create policy "Users can delete images from their own recipes"
  on public.recipe_images for delete
  using (
    exists (
      select 1 from public.recipes
      where recipes.id = recipe_images.recipe_id
      and recipes.author_id = auth.uid()
    )
  );

-- comments
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  rating smallint check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

create policy "Users can insert their own comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own comments"
  on public.comments for update
  using (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.comments for delete
  using (auth.uid() = user_id);
