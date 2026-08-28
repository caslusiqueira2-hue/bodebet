-- Remove the old public read policy (allows unauthenticated access)
DROP POLICY IF EXISTS "Public read access for board images" ON storage.objects;

-- Remove the current overly-permissive authenticated read policy
DROP POLICY IF EXISTS "Authenticated users can read board images" ON storage.objects;

-- Recreate: authenticated users can only read their own files
CREATE POLICY "Users can read their own board images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'board-images' AND auth.uid() = owner);
