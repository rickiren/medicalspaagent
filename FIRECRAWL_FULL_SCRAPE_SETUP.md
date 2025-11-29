# Firecrawl Full-Site Scrape Setup

This system implements a cost-efficient scraping workflow:
1. **Scrape once** - Full-site crawl using Firecrawl
2. **Store raw data** - Save HTML and text in Supabase
3. **Extract unlimited** - Run Gemini extraction on stored data (free)

## Why This Approach?

- **Cost-efficient**: Firecrawl charges per crawl, not per extraction
- **Scalable**: Store once, extract unlimited times
- **Debuggable**: Raw HTML preserved forever
- **Fast**: No need to re-crawl for new extractions

## Setup

### 1. Create Database Table

Run the SQL migration:

```bash
# In Supabase SQL Editor or via psql
psql -h your-db-host -U postgres -d postgres -f create-firecrawl-raw-table.sql
```

Or copy/paste the contents of `create-firecrawl-raw-table.sql` into Supabase SQL Editor.

### 2. Environment Variables

Ensure these are set in your `.env` or environment:

```bash
FIRECRAWL_API_KEY=your_firecrawl_api_key
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Schema

The `firecrawl_raw` table stores:
- `business_id` (TEXT) - References `businesses.id`
- `raw_html` (TEXT) - Raw HTML from main page (up to 1GB)
- `raw_text` (TEXT) - Plain text extracted from pages
- `pages` (JSONB) - Array of all crawled pages with their HTML/text
- `metadata` (JSONB) - Crawl stats, URLs, etc.

## Usage

### Option 1: Using API Endpoints

#### Scrape Full Site

```bash
POST /api/scrape-full-site
Content-Type: application/json

{
  "businessId": "example-medspa",
  "url": "https://example-medspa.com"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "business_id": "example-medspa",
    "raw_html": "...",
    "raw_text": "...",
    "pages": [...],
    "metadata": {...}
  },
  "stats": {
    "pagesCrawled": 15,
    "rawTextLength": 50000,
    "rawHtmlLength": 200000
  }
}
```

#### Extract Business Config

```bash
POST /api/extract-business-config
Content-Type: application/json

{
  "businessId": "example-medspa",
  "domain": "example-medspa.com"  // optional
}
```

Response:
```json
{
  "success": true,
  "config": {
    "id": "example-medspa",
    "name": "Example MedSpa",
    "services": [...],
    "locations": [...],
    ...
  }
}
```

### Option 2: Using Functions Directly

```javascript
import { scrapeFullSite } from './api/_lib/fullSiteScraper.js';
import { extractBusinessConfig } from './api/_lib/businessExtractor.js';

// Step 1: Scrape and store
const storedData = await scrapeFullSite('example-medspa', 'https://example-medspa.com');

// Step 2: Extract (can run unlimited times)
const config = await extractBusinessConfig('example-medspa', 'example-medspa.com', process.env.GEMINI_API_KEY);
```

## Workflow

```
1. User wants to scrape a website
   ↓
2. Call scrapeFullSite(businessId, url)
   - Firecrawl crawls entire site (costs money)
   - Raw HTML/text stored in Supabase
   ↓
3. Call extractBusinessConfig(businessId, domain, geminiApiKey)
   - Loads raw data from Supabase (free)
   - Sends to Gemini for extraction (Gemini costs, but no Firecrawl costs)
   - Stores BusinessConfig in businesses.config_json
   ↓
4. Can re-run extraction anytime without re-crawling
```

## Key Functions

### `scrapeFullSite(businessId, url)`
- Crawls entire website using Firecrawl
- Stores raw HTML and text in `firecrawl_raw` table
- Returns stored record

### `extractBusinessConfig(businessId, domain, geminiApiKey)`
- Loads raw data from `firecrawl_raw` table
- Extracts structured BusinessConfig using Gemini
- Stores config in `businesses.config_json`
- Returns extracted config

### `getRawCrawlData(businessId)`
- Retrieves stored raw crawl data
- Returns null if not found

### `hasRawCrawlData(businessId)`
- Checks if raw crawl data exists
- Returns boolean

## File Structure

```
api/
  _lib/
    firecrawlCrawler.js      # Full-site crawl using Firecrawl API
    firecrawlStorage.js       # Store/retrieve raw data in Supabase
    businessExtractor.js      # Extract BusinessConfig using Gemini
    fullSiteScraper.js        # Main entry point (scrape + store)
  scrape-full-site.js         # API endpoint for scraping
  extract-business-config.js  # API endpoint for extraction
create-firecrawl-raw-table.sql # Database migration
```

## Notes

- **HTML Storage**: Supabase TEXT columns support up to 1GB, which is more than enough for most websites
- **Crawl Limit**: Set to 50 pages by default (configurable in `firecrawlCrawler.js`)
- **Text Truncation**: Extraction truncates to 100k chars for Gemini (configurable in `businessExtractor.js`)
- **Idempotency**: `storeRawCrawlData` updates existing records if they exist
- **Error Handling**: All functions throw descriptive errors

## Cost Optimization

- **Before**: Scrape → Extract (pay Firecrawl every time)
- **After**: Scrape once → Store → Extract unlimited (pay Firecrawl once)

For 1000 businesses:
- **Before**: 1000 scrapes × $0.10 = $100
- **After**: 1000 scrapes × $0.10 = $100 (one-time)
- **Savings**: Re-extract 10 times = $900 saved

## Troubleshooting

### "No raw crawl data found"
- Run `scrapeFullSite()` first before extracting

### "FIRECRAWL_API_KEY not configured"
- Set environment variable in `.env` or deployment config

### "Crawl job timed out"
- Large sites may take longer, increase `maxAttempts` in `firecrawlCrawler.js`

### "Input text too long"
- Text is truncated to 100k chars for Gemini
- Adjust `maxLength` in `businessExtractor.js` if needed

