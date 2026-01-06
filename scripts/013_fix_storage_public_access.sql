-- Zorg dat de product-images bucket echt publiek toegankelijk is
-- Dit lost het probleem op dat afbeeldingen niet laden ondanks PUBLIC bucket status

-- Verwijder alle bestaande policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete product images" ON storage.objects;

-- Maak nieuwe, simpele policies voor publieke toegang
-- SELECT policy: iedereen kan afbeeldingen BEKIJKEN (download)
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- INSERT policy: iedereen kan afbeeldingen UPLOADEN (voor admin panel)
CREATE POLICY "Public can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- UPDATE policy: iedereen kan afbeeldingen UPDATEN
CREATE POLICY "Public can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- DELETE policy: iedereen kan afbeeldingen VERWIJDEREN
CREATE POLICY "Public can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

-- Verifieer dat de bucket bestaat en public is
UPDATE storage.buckets
SET public = true
WHERE id = 'product-images';

-- Check de resultaten
SELECT id, name, public FROM storage.buckets WHERE id = 'product-images';
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%product%';
