-- Add email column to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add comment
COMMENT ON COLUMN leads.email IS 'Email address for the lead/business';

-- Create index for email lookups (optional but useful)
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email) WHERE email IS NOT NULL;

