-- Create property_categories table for category management
CREATE TABLE IF NOT EXISTS public.property_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    icon text NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_property_category_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_property_category_updated_at ON public.property_categories;
CREATE TRIGGER trg_set_property_category_updated_at
BEFORE UPDATE ON public.property_categories
FOR EACH ROW EXECUTE FUNCTION public.set_property_category_updated_at();

-- Row Level Security
ALTER TABLE public.property_categories ENABLE ROW LEVEL SECURITY;

-- Policy: Allow read for everyone
CREATE POLICY "Allow public read on property_categories" ON public.property_categories
    FOR SELECT USING (true);

-- Policy: Allow admin insert/update/delete
CREATE POLICY "Allow admin write on property_categories" ON public.property_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    ); 