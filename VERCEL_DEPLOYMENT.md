# Vercel Deployment Guide

This guide will help you deploy the Serenity MedSpa Voice Agent to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Supabase project with:
   - Database table `businesses` created
   - Storage bucket `screenshots` created (for screenshot storage)
3. API keys for:
   - Firecrawl API
   - Google Gemini API

## Step 1: Create Supabase Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to Storage
3. Create a new bucket named `screenshots`
4. Set it to **Public** (so screenshots can be accessed via URL)
5. Optionally, set up a policy to allow uploads

## Step 2: Set Environment Variables in Vercel

In your Vercel project settings, add these environment variables:

### Required Variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key (for client-side operations)
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for server-side operations like storage uploads)
- `FIRECRAWL_API_KEY` - Your Firecrawl API key
- `GEMINI_API_KEY` - Your Google Gemini API key

### Optional Variables:
- `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` - Set to `1` to skip browser download (Vercel will handle this)

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

### Option B: Deploy via GitHub

1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Vercel will auto-detect Vite and configure the build
5. Add your environment variables in the project settings
6. Deploy!

## Step 4: Configure Playwright for Vercel

Playwright requires special configuration on Vercel due to size constraints. The deployment will automatically:

1. Skip browser download during build (via `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD`)
2. Use Supabase Storage for screenshots instead of local filesystem
3. Install browsers at runtime in serverless functions

**Note:** Playwright on Vercel has limitations:
- First screenshot capture may be slower (browser installation)
- Function size limits may require Vercel Pro plan for larger functions
- Consider using a screenshot service API for production if you hit limits

## Step 5: Verify Deployment

1. Check that your API routes work:
   - `/api/businesses` - Should return list of businesses
   - `/api/businesses/[id]` - Should return a single business
   - `/api/scrape-website` - Should scrape and save to database

2. Test screenshot generation:
   - Try scraping a website
   - Check Supabase Storage bucket for the screenshot
   - Verify the screenshot URL is saved in the database

## Troubleshooting

### Screenshots not working
- Verify Supabase Storage bucket `screenshots` exists and is public
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check Vercel function logs for errors

### API routes returning 500 errors
- Verify all environment variables are set
- Check Vercel function logs
- Ensure Supabase table structure matches expected schema

### Playwright timeout errors
- Increase function timeout in `vercel.json` (max 60s on Pro plan)
- Consider using a screenshot service API instead

## Architecture Notes

- **API Routes**: Converted from Vite middleware to Vercel serverless functions in `/api` directory
- **Screenshots**: Stored in Supabase Storage on Vercel, local filesystem in development
- **Database**: All data stored in Supabase PostgreSQL
- **Static Files**: Served from Vite's `dist` directory

## Support

For issues specific to:
- **Vercel**: Check Vercel documentation or support
- **Supabase**: Check Supabase documentation
- **Playwright**: Check Playwright documentation for serverless deployment

