-- Create RPC functions to handle variants with raw SQL
-- This bypasses the schema cache issue

-- Function to create product with variants
CREATE OR REPLACE FUNCTION create_product_with_variants(product_data JSONB)
RETURNS SETOF products AS $$
BEGIN
  RETURN QUERY
  INSERT INTO products (
    name,
    price,
    image_url,
    gallery_images,
    technical_drawing_url,
    category,
    description,
    features,
    materials,
    dimensions,
    colors,
    variants,
    stock,
    display_order,
    is_active
  ) VALUES (
    (product_data->>'name')::TEXT,
    (product_data->>'price')::NUMERIC,
    (product_data->>'image')::TEXT,
    (product_data->'gallery_images')::JSONB,
    (product_data->>'technical_drawing')::TEXT,
    (product_data->>'category')::TEXT,
    (product_data->>'description')::TEXT,
    (product_data->'features')::JSONB,
    (product_data->>'materials')::TEXT,
    (product_data->>'dimensions')::TEXT,
    (product_data->'colors')::JSONB,
    (product_data->'variants')::JSONB,
    COALESCE((product_data->>'stock')::INTEGER, 0),
    COALESCE((product_data->>'display_order')::INTEGER, 0),
    COALESCE((product_data->>'is_active')::BOOLEAN, TRUE)
  )
  RETURNING *;
END;
$$ LANGUAGE plpgsql;

-- Function to update product with variants
CREATE OR REPLACE FUNCTION update_product_with_variants(
  product_id TEXT,
  product_data JSONB
)
RETURNS SETOF products AS $$
BEGIN
  RETURN QUERY
  UPDATE products SET
    name = COALESCE((product_data->>'name')::TEXT, name),
    price = COALESCE((product_data->>'price')::NUMERIC, price),
    image_url = COALESCE((product_data->>'image')::TEXT, image_url),
    gallery_images = COALESCE((product_data->'gallery_images')::JSONB, gallery_images),
    technical_drawing_url = COALESCE((product_data->>'technical_drawing')::TEXT, technical_drawing_url),
    category = COALESCE((product_data->>'category')::TEXT, category),
    description = COALESCE((product_data->>'description')::TEXT, description),
    features = COALESCE((product_data->'features')::JSONB, features),
    materials = COALESCE((product_data->>'materials')::TEXT, materials),
    dimensions = COALESCE((product_data->>'dimensions')::TEXT, dimensions),
    colors = COALESCE((product_data->'colors')::JSONB, colors),
    variants = COALESCE((product_data->'variants')::JSONB, variants),
    stock = COALESCE((product_data->>'stock')::INTEGER, stock),
    display_order = COALESCE((product_data->>'display_order')::INTEGER, display_order),
    is_active = COALESCE((product_data->>'is_active')::BOOLEAN, is_active),
    updated_at = NOW()
  WHERE id::TEXT = product_id
  RETURNING *;
END;
$$ LANGUAGE plpgsql;
