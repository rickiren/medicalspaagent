-- Add contact_info_json column to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS contact_info_json JSONB;

-- Add comment
COMMENT ON COLUMN businesses.contact_info_json IS 'Contact information extracted from website (emails, phones, addresses, social links, booking links, etc.)';

