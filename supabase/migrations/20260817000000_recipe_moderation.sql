-- Editor role on profiles
alter table public.profiles
  add column role text not null default 'user' check (role in ('user', 'editor'));

-- Moderation status on recipes: every new recipe starts pending review
alter table public.recipes
  add column status text not null default 'pending' check (status in ('pending', 'published', 'rejected'));

-- Replace the old "everyone can see everything" select policy with
-- status-aware visibility: published recipes are public, authors can
-- always see their own (any status), and editors can see everything.
drop policy "Recipes are viewable by everyone" on public.recipes;

create policy "Published recipes are viewable by everyone"
  on public.recipes for select
  using (status = 'published');

create policy "Authors can view their own recipes"
  on public.recipes for select
  using (auth.uid() = author_id);

create policy "Editors can view all recipes"
  on public.recipes for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'editor'
    )
  );

-- Editors can update any recipe (title fixes, approve/reject), not
-- just their own.
create policy "Editors can update any recipe"
  on public.recipes for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'editor'
    )
  );
