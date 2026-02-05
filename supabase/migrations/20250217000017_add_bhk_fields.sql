-- Add new columns to the property_configurations table
ALTER TABLE property_configurations
ADD COLUMN floor_plan_url TEXT,
ADD COLUMN brochure_url TEXT,
ADD COLUMN ready_by TEXT; 