-- Step 1: Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can view active variants" ON product_variants;
    DROP POLICY IF EXISTS "Authenticated users can insert variants" ON product_variants;
    DROP POLICY IF EXISTS "Authenticated users can update variants" ON product_variants;
    DROP POLICY IF EXISTS "Authenticated users can delete variants" ON product_variants;
EXCEPTION 
    WHEN undefined_table THEN 
        -- Table doesn't exist yet, that's fine
        NULL;
END $$;

-- Step 2: Drop and recreate table
DROP TABLE IF EXISTS product_variants CASCADE;

-- Step 3: Create product_variants table
CREATE TABLE product_variants (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  sku TEXT,
  colors JSONB DEFAULT '[]'::jsonb,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  technical_drawing TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create indexes
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_active ON product_variants(is_active) WHERE is_active = true;

-- Step 5: Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Step 6: Create policies
CREATE POLICY "Anyone can view active variants"
  ON product_variants FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert variants"
  ON product_variants FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update variants"
  ON product_variants FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete variants"
  ON product_variants FOR DELETE
  TO authenticated
  USING (true);

-- Step 7: Verify table was created
SELECT 'product_variants table created successfully!' as result;
