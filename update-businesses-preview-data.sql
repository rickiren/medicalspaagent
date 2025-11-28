-- Add preview_data_json column to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS preview_data_json JSONB;

-- Add comment
COMMENT ON COLUMN businesses.preview_data_json IS 'Preview landing page data extracted from website (logo, colors, hero, navigation, etc.)';

