-- Drop existing table if you want to recreate it
DROP TABLE IF EXISTS product_variants CASCADE;

-- Create product_variants table
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

-- Create index for faster lookups
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_active ON product_variants(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can view active variants
CREATE POLICY "Anyone can view active variants"
  ON product_variants FOR SELECT
  USING (is_active = true);

-- Policies: Authenticated users can manage variants
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
