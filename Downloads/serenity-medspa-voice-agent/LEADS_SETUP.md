# Leads Table Setup and CSV Import

This guide will help you set up the leads table and import your Apify CSV data.

## Step 1: Create the Leads Table

You have two SQL files to run in order:

### Option A: Create Table from Scratch
If the `leads` table doesn't exist yet, run this first:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the entire contents of `create-leads-table.sql`
6. Click **Run** (or press Cmd/Ctrl + Enter)

### Option B: Add Missing Columns
If the `leads` table already exists but is missing columns, run this instead:

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy and paste the entire contents of `add-leads-columns.sql`
3. Click **Run**

## Step 2: Import CSV Data

After the table is set up, run the import script:

```bash
node import-leads-csv.js
```

Or specify a custom CSV path:

```bash
node import-leads-csv.js /path/to/your/file.csv
```

The script will:
- Parse the CSV file
- Extract domains from website URLs
- Store Google Maps data in JSONB format
- Insert/update leads in the database
- Show a summary of imported records

## CSV Data Mapping

The import script maps CSV columns to database fields:

| CSV Column | Database Field | Notes |
|------------|---------------|-------|
| `title` | `name` | Business name |
| `website` | `website` | Full website URL |
| `website` | `domain` | Extracted domain (e.g., example.com) |
| `phone` | `phone` | Phone number |
| `street`, `city`, `state`, `countryCode` | `google_maps_data.address` | Structured address |
| `totalScore` | `google_maps_data.rating` | Rating score |
| `reviewsCount` | `google_maps_data.reviewsCount` | Number of reviews |
| `categoryName` | `google_maps_data.category` | Business category |
| `url` | `google_maps_data.url` | Google Maps URL |
| All columns | `scraped_data.originalData` | Complete original CSV data |

## Table Structure

The `leads` table includes:

### Core Fields
- `id` - Unique identifier (generated from name + domain)
- `name` - Business name
- `website` - Website URL
- `domain` - Extracted domain
- `phone` - Phone number

### Google Maps Data (JSONB)
- Address (street, city, state, country)
- Rating and review count
- Category
- Google Maps URL and Place ID

### Scraped Data (JSONB)
- Source information
- Complete original CSV data
- Future additional scraped data

### Email Tracking
- `email_status` - 'not_sent', 'sent', 'opened', 'clicked', 'replied'
- `email_sent_at`, `email_opened_at`, `email_clicked_at` - Timestamps

### Widget Tracking
- `widget_generated` - Boolean
- `widget_url` - URL to generated widget

### Lead Management
- `status` - 'new', 'contacted', 'qualified', 'converted', 'lost'
- `converted_to_business_id` - Link to businesses table when converted
- `notes` - Free text notes

### Timestamps
- `created_at` - Auto-set on creation
- `updated_at` - Auto-updated on changes

## Troubleshooting

### Error: "Could not find the 'phone' column"
The table is missing some columns. Run `add-leads-columns.sql` in Supabase SQL Editor.

### Error: "Table does not exist"
Run `create-leads-table.sql` first to create the table.

### Error: "Missing Supabase credentials"
Make sure your `.env.local` file has:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_ANON_KEY`)

## Next Steps

After importing leads:
1. Review imported data in Supabase Dashboard → Table Editor → leads
2. Set up email outreach workflow
3. Generate widgets for qualified leads
4. Convert leads to businesses when they sign up

