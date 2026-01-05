-- Create RPC function to get products (bypasses schema cache)
CREATE OR REPLACE FUNCTION get_all_products()
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  price DECIMAL(10,2),
  image TEXT,
  technical_drawing TEXT,
  category TEXT,
  description TEXT,
  features TEXT[],
  materials TEXT,
  dimensions TEXT,
  colors JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id, name, price, image, technical_drawing, category, description, 
         features, materials, dimensions, colors, created_at, updated_at
  FROM products
  ORDER BY created_at DESC;
$$;
