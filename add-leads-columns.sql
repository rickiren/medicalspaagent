-- Add missing columns to leads table if they don't exist
-- This is safe to run multiple times

-- Add phone column
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add website column
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS website TEXT;

-- Add domain column
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS domain TEXT;

-- Add google_maps_data column
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS google_maps_data JSONB;

-- Add scraped_data column
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS scraped_data JSONB;

-- Add email_status column
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS email_status TEXT DEFAULT 'not_sent';

-- Add email tracking columns
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS email_opened_at TIMESTAMP;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS email_clicked_at TIMESTAMP;

-- Add widget columns
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS widget_generated BOOLEAN DEFAULT FALSE;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS widget_url TEXT;

-- Add status column
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';

-- Add conversion tracking
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS converted_to_business_id TEXT;

-- Add notes column
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add timestamps if missing
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email_status ON leads(email_status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_domain ON leads(domain);

