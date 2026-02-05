-- Migration: Make price nullable in property_configurations
ALTER TABLE property_configurations
ALTER COLUMN price DROP NOT NULL; 