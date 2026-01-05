-- Add email settings columns to invoice_settings table
ALTER TABLE invoice_settings 
ADD COLUMN IF NOT EXISTS email_from_name TEXT DEFAULT 'FORMD',
ADD COLUMN IF NOT EXISTS email_from_address TEXT DEFAULT 'noreply@formd.be',
ADD COLUMN IF NOT EXISTS email_subject_customer TEXT DEFAULT 'Bedankt voor je bestelling!',
ADD COLUMN IF NOT EXISTS email_subject_admin TEXT DEFAULT 'Nieuwe bestelling ontvangen',
ADD COLUMN IF NOT EXISTS email_footer_text TEXT DEFAULT 'Vragen? Neem gerust contact met ons op.';
