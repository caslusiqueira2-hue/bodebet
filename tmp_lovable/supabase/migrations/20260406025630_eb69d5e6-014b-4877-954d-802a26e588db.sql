-- Make bucket private
UPDATE storage.buckets SET public = false WHERE id = 'board-images';

-- Add SELECT policy for authenticated users
CREATE POLICY "Authenticated users can read board images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'board-images');
