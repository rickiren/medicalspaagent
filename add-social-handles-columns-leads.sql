-- Add social media handle columns to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS instagram TEXT;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS facebook TEXT;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS linkedin TEXT;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS tiktok TEXT;

-- Add comments
COMMENT ON COLUMN leads.instagram IS 'Instagram handle or URL';
COMMENT ON COLUMN leads.facebook IS 'Facebook page URL or handle';
COMMENT ON COLUMN leads.linkedin IS 'LinkedIn company page URL';
COMMENT ON COLUMN leads.tiktok IS 'TikTok handle or URL';

-- Create indexes for social media lookups (optional but useful)
CREATE INDEX IF NOT EXISTS idx_leads_instagram ON leads(instagram) WHERE instagram IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_facebook ON leads(facebook) WHERE facebook IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_linkedin ON leads(linkedin) WHERE linkedin IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_tiktok ON leads(tiktok) WHERE tiktok IS NOT NULL;

