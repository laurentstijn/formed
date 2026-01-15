-- Verificatie script om te checken of product_variants tabel bestaat
-- Dit script geeft duidelijke output over de tabel status

-- Check of de tabel bestaat
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'product_variants'
        ) THEN 'TABEL BESTAAT ✓'
        ELSE 'TABEL BESTAAT NIET ✗'
    END as tabel_status;

-- Als de tabel bestaat, toon alle kolommen
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'product_variants'
ORDER BY ordinal_position;

-- Tel het aantal rijen in de tabel (als die bestaat)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_variants') THEN
        RAISE NOTICE 'Aantal varianten in de tabel:';
        EXECUTE 'SELECT COUNT(*) FROM product_variants';
    END IF;
END $$;
