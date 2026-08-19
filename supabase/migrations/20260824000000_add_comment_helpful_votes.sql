create table public.comment_helpful_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  comment_id uuid not null references public.comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, comment_id)
);

alter table public.comment_helpful_votes enable row level security;

create policy "Users can view their own helpful votes"
  on public.comment_helpful_votes for select
  using (auth.uid() = user_id);

create policy "Users can add their own helpful votes"
  on public.comment_helpful_votes for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their own helpful votes"
  on public.comment_helpful_votes for delete
  using (auth.uid() = user_id);

alter table public.comments
  add column helpful_count integer not null default 0;

create or replace function public.handle_comment_helpful_insert()
returns trigger as $$
begin
  update public.comments set helpful_count = helpful_count + 1 where id = new.comment_id;
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.handle_comment_helpful_delete()
returns trigger as $$
begin
  update public.comments set helpful_count = greatest(helpful_count - 1, 0) where id = old.comment_id;
  return old;
end;
$$ language plpgsql security definer;

create trigger on_comment_helpful_insert
  after insert on public.comment_helpful_votes
  for each row execute function public.handle_comment_helpful_insert();

create trigger on_comment_helpful_delete
  after delete on public.comment_helpful_votes
  for each row execute function public.handle_comment_helpful_delete();
