-- Fix the specific property slug that has duplicate location name
-- First, let's see what the current slug looks like
SELECT id, title, location, slug FROM properties WHERE id = '7360835f-437f-499b-ad4f-4b50ae7c39da';

-- Update the slug to remove the duplicate location name
UPDATE properties 
SET slug = 'luxury-4-bhk-residences-at-ekta-lilou-ville-santacruz-west'
WHERE id = '7360835f-437f-499b-ad4f-4b50ae7c39da';

-- Verify the update
SELECT id, title, location, slug FROM properties WHERE id = '7360835f-437f-499b-ad4f-4b50ae7c39da';
