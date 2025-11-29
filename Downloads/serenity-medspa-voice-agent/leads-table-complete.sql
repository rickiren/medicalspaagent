-- =====================================================
-- Complete Leads Table Schema
-- Run this in Supabase SQL Editor to create/update the leads table
-- =====================================================

-- Create leads table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  website TEXT,
  domain TEXT,
  phone TEXT,
  email TEXT,
  instagram TEXT,
  facebook TEXT,
  linkedin TEXT,
  tiktok TEXT,
  google_maps_data JSONB,
  scraped_data JSONB,
  email_status TEXT DEFAULT 'not_sent',
  email_sent_at TIMESTAMP,
  email_opened_at TIMESTAMP,
  email_clicked_at TIMESTAMP,
  widget_generated BOOLEAN DEFAULT FALSE,
  widget_url TEXT,
  status TEXT DEFAULT 'new',
  converted_to_business_id TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add any missing columns (safe to run if table already exists)
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS instagram TEXT;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS facebook TEXT;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS linkedin TEXT;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS tiktok TEXT;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS website TEXT;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS domain TEXT;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS google_maps_data JSONB;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS scraped_data JSONB;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS email_status TEXT DEFAULT 'not_sent';

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS email_opened_at TIMESTAMP;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS email_clicked_at TIMESTAMP;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS widget_generated BOOLEAN DEFAULT FALSE;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS widget_url TEXT;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS converted_to_business_id TEXT;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create/update the trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at on row updates
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email_status ON leads(email_status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_domain ON leads(domain);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_instagram ON leads(instagram) WHERE instagram IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_facebook ON leads(facebook) WHERE facebook IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_linkedin ON leads(linkedin) WHERE linkedin IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_tiktok ON leads(tiktok) WHERE tiktok IS NOT NULL;

-- Add table and column comments
COMMENT ON TABLE leads IS 'Leads scraped from Apify and other sources';
COMMENT ON COLUMN leads.id IS 'Unique identifier (generated from name + domain)';
COMMENT ON COLUMN leads.name IS 'Business name';
COMMENT ON COLUMN leads.website IS 'Full website URL';
COMMENT ON COLUMN leads.domain IS 'Extracted domain from website (e.g., example.com)';
COMMENT ON COLUMN leads.phone IS 'Phone number';
COMMENT ON COLUMN leads.email IS 'Email address for the lead/business';
COMMENT ON COLUMN leads.instagram IS 'Instagram handle or URL';
COMMENT ON COLUMN leads.facebook IS 'Facebook page URL or handle';
COMMENT ON COLUMN leads.linkedin IS 'LinkedIn company page URL';
COMMENT ON COLUMN leads.tiktok IS 'TikTok handle or URL';
COMMENT ON COLUMN leads.google_maps_data IS 'Google Maps information (address, rating, reviews, category, URL, place_id)';
COMMENT ON COLUMN leads.scraped_data IS 'Additional scraped information from websites and original CSV data';
COMMENT ON COLUMN leads.email_status IS 'Status of email outreach: not_sent, sent, opened, clicked, replied';
COMMENT ON COLUMN leads.email_sent_at IS 'Timestamp when email was sent';
COMMENT ON COLUMN leads.email_opened_at IS 'Timestamp when email was opened';
COMMENT ON COLUMN leads.email_clicked_at IS 'Timestamp when email link was clicked';
COMMENT ON COLUMN leads.widget_generated IS 'Whether a custom widget has been generated for this lead';
COMMENT ON COLUMN leads.widget_url IS 'URL to the generated widget';
COMMENT ON COLUMN leads.status IS 'Lead status: new, contacted, qualified, converted, lost';
COMMENT ON COLUMN leads.converted_to_business_id IS 'Reference to businesses.id when lead is converted to a business';
COMMENT ON COLUMN leads.notes IS 'Free text notes about the lead';
COMMENT ON COLUMN leads.created_at IS 'Timestamp when lead was created';
COMMENT ON COLUMN leads.updated_at IS 'Timestamp when lead was last updated (auto-updated)';

