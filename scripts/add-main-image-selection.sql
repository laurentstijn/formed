-- Add main_image_source field to track the source of the main image
-- Can be 'color:{colorName}' for color-specific images or 'gallery:{index}' for gallery images
ALTER TABLE products ADD COLUMN IF NOT EXISTS main_image_source text;

-- Add comment to explain the field
COMMENT ON COLUMN products.main_image_source IS 'Source of the main homepage image. Format: "color:{colorName}" or "gallery:{index}"';
