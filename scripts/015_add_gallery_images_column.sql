-- Add gallery_images column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;

-- Update existing products to have empty array if null
UPDATE products SET gallery_images = '[]'::jsonb WHERE gallery_images IS NULL;

COMMENT ON COLUMN products.gallery_images IS 'Array of additional product images (lifestyle, details, context photos) independent of color variants';
