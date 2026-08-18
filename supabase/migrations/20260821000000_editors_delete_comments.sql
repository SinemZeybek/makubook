create policy "Editors can delete any comment"
  on public.comments for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'editor'
    )
  );
