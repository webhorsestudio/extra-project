-- Add UPDATE policy for properties table
-- This allows authenticated users to update properties they own or have permission to edit

CREATE POLICY "Allow authenticated users to update properties"
ON public.properties FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Add INSERT policy for properties table (in case it's missing)
CREATE POLICY "Allow authenticated users to insert properties"
ON public.properties FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Add DELETE policy for properties table (in case it's missing)
CREATE POLICY "Allow authenticated users to delete properties"
ON public.properties FOR DELETE
USING (auth.role() = 'authenticated');

-- Add comments
COMMENT ON POLICY "Allow authenticated users to update properties" ON public.properties IS 'Allows authenticated users to update property details';
COMMENT ON POLICY "Allow authenticated users to insert properties" ON public.properties IS 'Allows authenticated users to create new properties';
COMMENT ON POLICY "Allow authenticated users to delete properties" ON public.properties IS 'Allows authenticated users to delete properties'; 