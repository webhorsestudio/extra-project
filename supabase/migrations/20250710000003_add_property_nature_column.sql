-- Add property_nature_enum type
DO $$ BEGIN
    CREATE TYPE property_nature_enum AS ENUM ('Sell', 'Rent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add property_nature column to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS property_nature property_nature_enum NOT NULL DEFAULT 'Sell';

-- Add comment for clarity
COMMENT ON COLUMN properties.property_nature IS 'Nature of the property: Sell or Rent'; 