-- Create enum for popup ad types
CREATE TYPE popup_ad_type AS ENUM (
  'banner',
  'modal',
  'toast',
  'slide_in',
  'fullscreen'
);

-- Create enum for popup ad positions
CREATE TYPE popup_ad_position AS ENUM (
  'top_left',
  'top_right',
  'bottom_left',
  'bottom_right',
  'center',
  'top_center',
  'bottom_center'
);

-- Create enum for popup ad status
CREATE TYPE popup_ad_status AS ENUM (
  'draft',
  'published',
  'archived'
);

-- Create popup_ads table
CREATE TABLE popup_ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type popup_ad_type NOT NULL DEFAULT 'modal',
  position popup_ad_position NOT NULL DEFAULT 'center',
  content JSONB NOT NULL DEFAULT '{}',
  image_url TEXT,
  link_url TEXT,
  link_text TEXT,
  status popup_ad_status NOT NULL DEFAULT 'draft',
  priority INTEGER DEFAULT 0,
  display_delay INTEGER DEFAULT 0, -- Delay in seconds before showing
  display_duration INTEGER DEFAULT 0, -- How long to show (0 = until dismissed)
  max_display_count INTEGER DEFAULT 0, -- 0 = unlimited
  user_display_count INTEGER DEFAULT 0, -- Track how many times shown to users
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  show_on_mobile BOOLEAN DEFAULT true,
  show_on_desktop BOOLEAN DEFAULT true,
  show_on_tablet BOOLEAN DEFAULT true,
  target_pages TEXT[], -- Specific pages to show on
  exclude_pages TEXT[], -- Pages to exclude from
  user_segments JSONB DEFAULT '{}', -- Target specific user segments
  conditions JSONB DEFAULT '{}', -- Additional display conditions
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_popup_ads_status ON popup_ads(status);
CREATE INDEX idx_popup_ads_type ON popup_ads(type);
CREATE INDEX idx_popup_ads_active ON popup_ads(is_active);
CREATE INDEX idx_popup_ads_priority ON popup_ads(priority);
CREATE INDEX idx_popup_ads_dates ON popup_ads(start_date, end_date);
CREATE INDEX idx_popup_ads_platform ON popup_ads(show_on_mobile, show_on_desktop, show_on_tablet);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_popup_ads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_popup_ads_updated_at
  BEFORE UPDATE ON popup_ads
  FOR EACH ROW
  EXECUTE FUNCTION update_popup_ads_updated_at();

-- Insert sample popup ad
INSERT INTO popup_ads (
  title,
  slug,
  type,
  position,
  content,
  image_url,
  link_url,
  link_text,
  status,
  priority,
  display_delay,
  show_on_mobile,
  show_on_desktop
) VALUES (
  'Welcome Offer',
  'welcome-offer',
  'modal',
  'center',
  '{"title": "Welcome to Our Site!", "description": "Get 20% off your first purchase", "button_text": "Claim Offer"}',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
  '/offers/welcome',
  'Learn More',
  'published',
  1,
  3,
  true,
  true
);
