# Website Scraping Setup

## Overview

The system can automatically scrape websites and extract business information to create AI receptionist configurations.

## Setup

### 1. Add Firecrawl API Key

Add to `.env.local`:
```
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
```

Get your API key from: https://firecrawl.dev

### 2. How It Works

1. **User enters website URL** in the Dashboard
2. **Firecrawl scrapes** the website (homepage + subpages, max depth 2)
3. **Gemini AI normalizes** the scraped data into BusinessConfig JSON
4. **Config is pre-filled** in the editor for review/editing
5. **User saves** to Supabase

## Pipeline Flow

```
Website URL → Firecrawl Scrape → Markdown Content → Gemini Normalization → BusinessConfig JSON → Editor → Supabase
```

## What Gets Extracted

- Business name & tagline
- Services (name, description, price, duration)
- Locations (name, address, phone)
- Operating hours
- FAQs
- Booking links (Calendly, etc.)
- AI personality (tone, identity)

## Usage

1. Go to Dashboard
2. Click "Scrape Website" button
3. Enter website URL and Business ID
4. Wait for scraping and normalization
5. Review pre-filled config in editor
6. Edit if needed
7. Save to Supabase

## API Endpoint

`POST /api/scrape-website`

Body:
```json
{
  "url": "https://example-medspa.com",
  "businessId": "example-medspa",
  "domain": "example-medspa.com"
}
```

Response:
```json
{
  "config": { ...BusinessConfig }
}
```

