alter table public.profiles
  add column birthday date,
  add column avatar_url text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, birthday)
  values (
    new.id,
    new.raw_user_meta_data->>'display_name',
    (new.raw_user_meta_data->>'birthday')::date
  );
  return new;
end;
$$;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

create policy "Avatars are viewable by everyone"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
