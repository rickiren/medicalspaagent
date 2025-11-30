-- =====================================================
-- Add Instagram Outreach Columns to Leads Table
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add instagram_handle column (separate from instagram which may contain URLs)
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS instagram_handle TEXT;

-- Add personalized_message column for Instagram DM content
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS personalized_message TEXT;

-- Add outreach_status column with default 'pending'
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS outreach_status TEXT DEFAULT 'pending';

-- Create index for outreach_status for faster queries
CREATE INDEX IF NOT EXISTS idx_leads_outreach_status ON leads(outreach_status) WHERE outreach_status IS NOT NULL;

-- Add comments
COMMENT ON COLUMN leads.instagram_handle IS 'Instagram handle (without @) for outreach bot';
COMMENT ON COLUMN leads.personalized_message IS 'Personalized message to send via Instagram DM';
COMMENT ON COLUMN leads.outreach_status IS 'Instagram outreach status: pending, sent, failed';

