-- Create leads table for Apify scraped data
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  website TEXT,
  domain TEXT, -- extracted from website
  phone TEXT,
  google_maps_data JSONB, -- store Google Maps info (address, phone, reviews, etc.)
  scraped_data JSONB, -- flexible storage for additional scraped info
  email_status TEXT DEFAULT 'not_sent', -- 'not_sent', 'sent', 'opened', 'clicked', 'replied'
  email_sent_at TIMESTAMP,
  email_opened_at TIMESTAMP,
  email_clicked_at TIMESTAMP,
  widget_generated BOOLEAN DEFAULT FALSE,
  widget_url TEXT,
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'lost'
  converted_to_business_id TEXT, -- reference to businesses.id when converted
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create function to automatically update updated_at timestamp (if not exists)
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

-- Add comments
COMMENT ON TABLE leads IS 'Leads scraped from Apify and other sources';
COMMENT ON COLUMN leads.google_maps_data IS 'Google Maps information (address, rating, reviews, etc.)';
COMMENT ON COLUMN leads.scraped_data IS 'Additional scraped information from websites';
COMMENT ON COLUMN leads.email_status IS 'Status of email outreach: not_sent, sent, opened, clicked, replied';
COMMENT ON COLUMN leads.status IS 'Lead status: new, contacted, qualified, converted, lost';

