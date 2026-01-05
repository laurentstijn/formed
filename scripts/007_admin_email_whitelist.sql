-- Update the trigger to check allowed admin emails
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create allowed_admins table for email whitelist
CREATE TABLE IF NOT EXISTS public.allowed_admins (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.allowed_admins ENABLE ROW LEVEL SECURITY;

-- Only admins can view the whitelist
CREATE POLICY "Admins can view allowed_admins"
  ON public.allowed_admins FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.admins));

-- Function to check if email is allowed and add to admins
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Check if email is in allowed list
  IF EXISTS (SELECT 1 FROM public.allowed_admins WHERE email = NEW.email) THEN
    -- Add to admins table
    INSERT INTO public.admins (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Note: Add your admin email(s) manually:
-- INSERT INTO public.allowed_admins (email) VALUES ('jouw-email@example.com');
