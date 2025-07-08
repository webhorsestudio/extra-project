-- Create property_views table for tracking property views

CREATE TABLE IF NOT EXISTS property_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    viewer_ip INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_viewed_at ON property_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_property_views_viewer_ip ON property_views(viewer_ip);

-- Enable RLS
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to property views" ON property_views
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert property views" ON property_views
    FOR INSERT WITH CHECK (true);

-- Add comments
COMMENT ON TABLE property_views IS 'Tracks property view analytics';
COMMENT ON COLUMN property_views.property_id IS 'Reference to the viewed property';
COMMENT ON COLUMN property_views.viewer_ip IS 'IP address of the viewer';
COMMENT ON COLUMN property_views.user_agent IS 'User agent string of the viewer';
COMMENT ON COLUMN property_views.viewed_at IS 'Timestamp when the property was viewed'; 