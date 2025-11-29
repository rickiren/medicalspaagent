# Local Development Setup for Preview URLs

## Quick Fix

Add this to your `.env.local` file (or `.env`):

```env
PUBLIC_APP_URL=http://localhost:5173
```

(Change `5173` to whatever port your dev server runs on - check your `vite.config.js` or `package.json`)

## How It Works Locally

When scraping locally, the system will:

1. **Check for `PUBLIC_APP_URL`** - ✅ **Set this in your `.env.local`**
2. **Check for `NEXT_PUBLIC_APP_URL`** - Alternative name
3. **Fallback** - If none are set, defaults to `http://localhost:5173` (Vite default)

## Setting Up

### Step 1: Add to `.env.local`

```env
# Your existing variables
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
GEMINI_API_KEY=your_gemini_key
FIRECRAWL_API_KEY=your_firecrawl_key

# Add this for preview URLs
PUBLIC_APP_URL=http://localhost:5173
```

### Step 2: Check Your Dev Server Port

If your dev server runs on a different port (like `3000`, `8080`, etc.), update it:

```env
PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Restart Your Dev Server

After adding the environment variable, restart your dev server:

```bash
npm run dev
```

### Step 4: Test

1. Scrape a website
2. Check your database - `preview_url` and `widget_url` should now be:
   - `http://localhost:5173/preview/[businessId]`
   - `http://localhost:5173/widget/[businessId]`

## Updating Existing Businesses

If you already scraped businesses before setting this up, update them:

### Option 1: SQL (in Supabase)

```sql
UPDATE businesses
SET 
  preview_url = 'http://localhost:5173/preview/' || id,
  widget_url = 'http://localhost:5173/widget/' || id
WHERE preview_url IS NULL OR widget_url IS NULL;
```

### Option 2: Re-scrape

Just scrape the websites again - the URLs will be generated correctly now.

## Production vs Local

- **Local:** `http://localhost:5173/preview/[businessId]`
- **Production:** `https://yourdomain.com/preview/[businessId]`

The code automatically detects which environment you're in and uses the appropriate URL.

## Troubleshooting

**URLs still showing as `https://yourdomain.com`:**
- Make sure you added `PUBLIC_APP_URL` to `.env.local` (not just `.env`)
- Restart your dev server after adding the variable
- Check that the port matches your actual dev server port

**URLs showing as `http://localhost:5173` but you want a different port:**
- Update `PUBLIC_APP_URL` in `.env.local` to match your port
- Restart dev server

