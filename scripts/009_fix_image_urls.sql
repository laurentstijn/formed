-- Fix image URLs that end with -upload by adding .png extension
-- This fixes existing uploads that were missing file extensions

-- Fix the main image field
UPDATE products 
SET image = image || '.png'
WHERE image LIKE '%-upload';

-- Fix images within the colors array
UPDATE products
SET colors = (
  SELECT jsonb_agg(
    jsonb_set(
      color,
      '{images}',
      (
        SELECT jsonb_agg(
          CASE 
            WHEN img::text LIKE '%-upload"%' 
            THEN to_jsonb(replace(img::text, '-upload"', '-upload.png"')::text)
            ELSE img
          END
        )
        FROM jsonb_array_elements(color->'images') AS img
      )
    )
  )
  FROM jsonb_array_elements(colors) AS color
)
WHERE colors::text LIKE '%-upload%';

-- Verify the changes
SELECT name, image, colors
FROM products
WHERE name = 'Klein Wandhaakje';
