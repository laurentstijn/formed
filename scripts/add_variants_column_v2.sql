-- Add variants column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS variants jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN products.variants IS 'Product variants stored as JSONB array with name, price, stock, and sku';

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'variants';
