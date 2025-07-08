-- Change ready_by column from DATE to TEXT to match frontend format
ALTER TABLE property_configurations 
ALTER COLUMN ready_by TYPE TEXT; 