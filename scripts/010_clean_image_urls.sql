-- Remove all old Vercel Blob URLs and reset images to empty
-- Users will need to re-upload their product images to /public/products/

UPDATE products
SET 
  image = NULL,
  technical_drawing = NULL,
  colors = (
    SELECT jsonb_agg(
      jsonb_set(
        color,
        '{images}',
        '[]'::jsonb
      )
    )
    FROM jsonb_array_elements(colors) color
  )
WHERE image LIKE 'https://txseeeyngm0nlung%'
   OR technical_drawing LIKE 'https://txseeeyngm0nlung%'
   OR colors::text LIKE '%txseeeyngm0nlung%';

-- Verify the cleanup
SELECT id, name, image, technical_drawing, 
  jsonb_pretty(colors) as colors_formatted
FROM products;
