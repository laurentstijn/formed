-- Create a function to safely decrease product stock
CREATE OR REPLACE FUNCTION decrease_product_stock(product_id INTEGER, quantity INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(stock - quantity, 0)
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;
