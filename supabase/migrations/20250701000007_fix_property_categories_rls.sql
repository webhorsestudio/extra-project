-- Fix RLS policy for property_categories table
-- Drop the existing policy
DROP POLICY IF EXISTS "Allow admin write on property_categories" ON public.property_categories;

-- Create the corrected policy
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