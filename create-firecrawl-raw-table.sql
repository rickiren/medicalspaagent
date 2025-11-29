-- Create firecrawl_raw table for storing raw HTML and text from full-site crawls
-- This allows us to scrape once and extract unlimited times for free

-- Step 1: Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS firecrawl_raw (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  raw_html TEXT,
  raw_text TEXT,
  pages JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Add lead_id column if it doesn't exist (for existing tables)
ALTER TABLE firecrawl_raw 
ADD COLUMN IF NOT EXISTS lead_id TEXT;

-- Step 3: Add foreign key constraint for lead_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'firecrawl_raw_lead_id_fkey'
  ) THEN
    ALTER TABLE firecrawl_raw 
    ADD CONSTRAINT firecrawl_raw_lead_id_fkey 
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 4: Make business_id nullable (in case it was created as NOT NULL)
ALTER TABLE firecrawl_raw 
ALTER COLUMN business_id DROP NOT NULL;

-- Step 5: Add constraint to ensure at least one ID is provided
ALTER TABLE firecrawl_raw 
DROP CONSTRAINT IF EXISTS firecrawl_raw_has_id;

ALTER TABLE firecrawl_raw 
ADD CONSTRAINT firecrawl_raw_has_id CHECK (lead_id IS NOT NULL OR business_id IS NOT NULL);

-- Step 6: Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_firecrawl_raw_lead_id ON firecrawl_raw(lead_id);
CREATE INDEX IF NOT EXISTS idx_firecrawl_raw_business_id ON firecrawl_raw(business_id);

-- Step 7: Add comments
COMMENT ON TABLE firecrawl_raw IS 'Stores raw HTML and text from Firecrawl full-site crawls. Allows unlimited extraction without re-crawling.';
COMMENT ON COLUMN firecrawl_raw.lead_id IS 'Reference to leads.id - used when scraping a lead';
COMMENT ON COLUMN firecrawl_raw.business_id IS 'Reference to businesses.id - used when scraping a business (or when lead is converted)';
COMMENT ON COLUMN firecrawl_raw.raw_html IS 'Raw HTML content from the main page (can be up to 1GB)';
COMMENT ON COLUMN firecrawl_raw.raw_text IS 'Plain text extracted from the main page';
COMMENT ON COLUMN firecrawl_raw.pages IS 'JSONB array of all crawled pages with their raw HTML and text';
COMMENT ON COLUMN firecrawl_raw.metadata IS 'Additional metadata from Firecrawl (crawl stats, URLs, etc.)';
