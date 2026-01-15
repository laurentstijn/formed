-- Add variants column to products table to store product variants as JSON
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the variants column structure
COMMENT ON COLUMN products.variants IS 'Array of product variants with fields: name, price, stock, sku, image_url';
