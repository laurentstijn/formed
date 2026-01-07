-- Create a database function to update main_image_source
-- This bypasses the TypeScript schema cache validation issue
CREATE OR REPLACE FUNCTION update_product_main_image_source(
  product_id uuid,
  new_main_image_source text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET main_image_source = new_main_image_source
  WHERE id = product_id;
END;
$$;
