-- Create product_variants table
CREATE TABLE IF NOT EXISTS public.product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    sku TEXT,
    colors JSONB DEFAULT '[]'::jsonb,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    technical_drawing TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on product_id for faster queries
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_is_active ON public.product_variants(is_active);

-- Enable Row Level Security
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view active variants" ON public.product_variants;
DROP POLICY IF EXISTS "Admins can manage variants" ON public.product_variants;

-- Policy: Anyone can view active variants
CREATE POLICY "Anyone can view active variants"
ON public.product_variants
FOR SELECT
USING (is_active = true);

-- Policy: Admins can manage all variants
CREATE POLICY "Admins can manage variants"
ON public.product_variants
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.admins
        WHERE admins.email = auth.jwt()->>'email'
    )
);

-- Verify table creation
SELECT 
    'product_variants table created successfully!' as status,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'product_variants';
