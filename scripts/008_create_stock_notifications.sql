-- "Verwittig mij bij herbevoorrading" signups
CREATE TABLE IF NOT EXISTS stock_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  notified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notified_at TIMESTAMPTZ,
  UNIQUE (product_id, email)
);

CREATE INDEX IF NOT EXISTS stock_notifications_product_id_idx ON stock_notifications(product_id);

ALTER TABLE stock_notifications ENABLE ROW LEVEL SECURITY;

-- API routes use the service role key, which bypasses RLS by default.
-- No public policies are added, so this table is not readable/writable via the anon key.
