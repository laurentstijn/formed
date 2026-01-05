-- Create invoice settings table for admin customization
CREATE TABLE IF NOT EXISTS invoice_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT DEFAULT 'FORMD',
  company_subtitle TEXT DEFAULT 'Design & Interieur',
  company_address TEXT DEFAULT 'België',
  company_vat TEXT,
  company_phone TEXT,
  company_email TEXT,
  invoice_footer TEXT DEFAULT 'Bedankt voor je bestelling!',
  logo_url TEXT DEFAULT '/formed-primary.png',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO invoice_settings (company_name, company_subtitle, company_address)
VALUES ('FORMD', 'Design & Interieur', 'België')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE invoice_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read invoice settings
CREATE POLICY "Anyone can read invoice settings"
  ON invoice_settings FOR SELECT
  TO PUBLIC
  USING (true);

-- Only admins can update invoice settings
CREATE POLICY "Only admins can update invoice settings"
  ON invoice_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  );
