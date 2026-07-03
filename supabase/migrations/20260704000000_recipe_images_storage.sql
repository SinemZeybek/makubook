-- storage bucket for recipe photos
insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true);

create policy "Recipe photos are viewable by everyone"
  on storage.objects for select
  using (bucket_id = 'recipe-images');

create policy "Authenticated users can upload their own recipe photos"
  on storage.objects for insert
  with check (
    bucket_id = 'recipe-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own recipe photos"
  on storage.objects for delete
  using (
    bucket_id = 'recipe-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
