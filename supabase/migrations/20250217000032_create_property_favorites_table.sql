-- Create property_favorites table for tracking user favorites

CREATE TABLE IF NOT EXISTS property_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(property_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_favorites_property_id ON property_favorites(property_id);
CREATE INDEX IF NOT EXISTS idx_property_favorites_user_id ON property_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_property_favorites_created_at ON property_favorites(created_at);

-- Enable RLS
ALTER TABLE property_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow users to view their own favorites" ON property_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own favorites" ON property_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own favorites" ON property_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE property_favorites IS 'Tracks user favorite properties';
COMMENT ON COLUMN property_favorites.property_id IS 'Reference to the favorited property';
COMMENT ON COLUMN property_favorites.user_id IS 'Reference to the user who favorited';
COMMENT ON COLUMN property_favorites.created_at IS 'Timestamp when the property was favorited'; 