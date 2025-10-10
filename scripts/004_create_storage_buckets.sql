-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for plant images
INSERT INTO storage.buckets (id, name, public)
VALUES ('plants', 'plants', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for post images
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Set up storage policies for plant images
CREATE POLICY "Plant images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'plants');

CREATE POLICY "Authenticated users can upload plant images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'plants' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own plant images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'plants' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own plant images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'plants' AND
  auth.role() = 'authenticated'
);

-- Set up storage policies for post images
CREATE POLICY "Post images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'posts');

CREATE POLICY "Authenticated users can upload post images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'posts' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own post images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'posts' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own post images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'posts' AND
  auth.role() = 'authenticated'
);
