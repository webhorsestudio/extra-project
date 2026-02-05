-- Allow authenticated users to insert property_images and property_configurations
-- so the public /properties/add form can create properties with images and BHK configs.

-- property_images: allow authenticated insert (e.g. for property add flow)
CREATE POLICY "Allow authenticated users to insert property_images"
  ON property_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- property_configurations: allow authenticated insert (e.g. for property add flow)
CREATE POLICY "Allow authenticated users to insert property_configurations"
  ON property_configurations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

COMMENT ON POLICY "Allow authenticated users to insert property_images" ON property_images
  IS 'Allows public add-property form to save images after creating a property';
COMMENT ON POLICY "Allow authenticated users to insert property_configurations" ON property_configurations
  IS 'Allows public add-property form to save BHK configurations after creating a property';
