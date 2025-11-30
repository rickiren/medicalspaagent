-- =====================================================
-- Add Follow Status Column to Leads Table
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add follow_status column with default 'pending'
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS follow_status TEXT DEFAULT 'pending';

-- Create index for follow_status for faster queries
CREATE INDEX IF NOT EXISTS idx_leads_follow_status ON leads(follow_status) WHERE follow_status IS NOT NULL;

-- Add comment
COMMENT ON COLUMN leads.follow_status IS 'Instagram follow status: pending, followed, failed';

