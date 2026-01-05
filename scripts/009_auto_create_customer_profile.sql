-- Add UPDATE policy for customers to update their own data
CREATE POLICY "customers_update_own"
  ON public.customers FOR UPDATE
  USING (auth.jwt() ->> 'email' = email)
  WITH CHECK (auth.jwt() ->> 'email' = email);

-- Add more columns to customers table for full profile
ALTER TABLE public.customers 
  ADD COLUMN IF NOT EXISTS address_line1 text,
  ADD COLUMN IF NOT EXISTS address_line2 text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'België',
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS customers_user_id_idx ON public.customers(user_id);

-- Function to automatically create customer profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_customer()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customers (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create customer profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created_add_to_customers ON auth.users;
CREATE TRIGGER on_auth_user_created_add_to_customers
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_customer();

-- Backfill existing users who don't have customer records yet
INSERT INTO public.customers (user_id, email, first_name, last_name)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'first_name', ''),
  COALESCE(u.raw_user_meta_data->>'last_name', '')
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.customers c WHERE c.user_id = u.id
)
ON CONFLICT DO NOTHING;
