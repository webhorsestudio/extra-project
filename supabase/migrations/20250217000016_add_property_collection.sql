-- Create a new ENUM type for property collections
CREATE TYPE property_collection_enum AS ENUM ('Newly Launched', 'Featured', 'General');

-- Add the new column to the properties table
ALTER TABLE properties
ADD COLUMN property_collection property_collection_enum NOT NULL DEFAULT 'General'; 