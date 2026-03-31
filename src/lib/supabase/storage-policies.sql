-- ============================================
-- STORAGE POLICIES for the "images" bucket
-- Run this in the Supabase SQL Editor
-- ============================================

-- Allow anyone to view/download images (public bucket)
create policy "Public read access"
  on storage.objects for select
  using (bucket_id = 'images');

-- Allow authenticated users to upload images
create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check (
    bucket_id = 'images'
    and auth.role() = 'authenticated'
  );

-- Allow users to delete their own uploaded images
create policy "Users can delete own images"
  on storage.objects for delete
  using (
    bucket_id = 'images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
