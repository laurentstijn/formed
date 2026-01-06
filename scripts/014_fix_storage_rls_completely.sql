-- Fix Supabase Storage RLS policies om publieke toegang toe te staan
-- Dit lost het probleem op dat afbeeldingen niet toegankelijk zijn na upload

-- Stap 1: Verwijder alle bestaande policies voor de product-images bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access" ON storage.objects;

-- Stap 2: Maak nieuwe policies die ECHT publieke toegang geven
-- BELANGRIJK: De policies moeten specifiek zijn voor de product-images bucket

-- Allow anyone to SELECT (view/download) images from product-images bucket
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow anyone to INSERT (upload) images to product-images bucket  
CREATE POLICY "Anyone can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- Allow anyone to UPDATE images in product-images bucket
CREATE POLICY "Anyone can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Allow anyone to DELETE images from product-images bucket
CREATE POLICY "Anyone can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

-- Stap 3: Zorg ervoor dat de bucket zelf ook PUBLIC is
UPDATE storage.buckets 
SET public = true 
WHERE id = 'product-images';
