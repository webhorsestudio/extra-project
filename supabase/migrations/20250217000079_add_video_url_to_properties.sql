-- Add video_url column to properties table for YouTube video links

-- Add the video_url column
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN properties.video_url IS 'YouTube or other video URL for property showcase';

-- Create index for better performance on video_url queries (optional)
CREATE INDEX IF NOT EXISTS idx_properties_video_url ON properties(video_url) WHERE video_url IS NOT NULL;
