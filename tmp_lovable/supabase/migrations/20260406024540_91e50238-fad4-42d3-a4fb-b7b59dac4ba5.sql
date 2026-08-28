-- Drop existing insecure policies
DROP POLICY IF EXISTS "Allow uploads to board images" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes from board images" ON storage.objects;

-- Recreate INSERT policy requiring authentication
CREATE POLICY "Authenticated users can upload to board images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'board-images');

-- Recreate DELETE policy requiring ownership
CREATE POLICY "Users can delete their own board images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'board-images' AND auth.uid() = owner);

-- Add UPDATE policy for overwrites
CREATE POLICY "Users can update their own board images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'board-images' AND auth.uid() = owner);