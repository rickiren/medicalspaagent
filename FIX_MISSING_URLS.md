# Fix Missing Preview/Widget URLs

If businesses were scraped but are missing `preview_url` and `widget_url`, here's how to fix it:

## Option 1: Re-scrape the Business

The simplest solution - just scrape the website again. The updated code will now generate and save the URLs.

## Option 2: Use the Update API Endpoint

I've created an API endpoint to update existing businesses:

### Update a Single Business

```bash
curl -X POST https://yourdomain.com/api/update-preview-urls \
  -H "Content-Type: application/json" \
  -d '{"businessId": "your-business-id"}'
```

### Update All Businesses Missing URLs

```bash
curl -X POST https://yourdomain.com/api/update-preview-urls \
  -H "Content-Type: application/json" \
  -d '{}'
```

This will update all businesses that have `null` values for `preview_url` or `widget_url`.

## Option 3: Manual SQL Update

Run this in your Supabase SQL Editor:

```sql
-- Update a specific business
UPDATE businesses
SET 
  preview_url = 'https://yourdomain.com/preview/' || id,
  widget_url = 'https://yourdomain.com/widget/' || id
WHERE id = 'your-business-id';

-- Or update all businesses missing URLs
UPDATE businesses
SET 
  preview_url = 'https://yourdomain.com/preview/' || id,
  widget_url = 'https://yourdomain.com/widget/' || id
WHERE preview_url IS NULL OR widget_url IS NULL;
```

**Important:** Replace `https://yourdomain.com` with your actual domain!

## Check Your Environment Variables

Make sure you have one of these set in Firebase Functions:

- `PUBLIC_APP_URL` (your Firebase hosting URL or custom domain)
- `NEXT_PUBLIC_APP_URL` (alternative name)
- `FIREBASE_HOSTING_URL` (Firebase hosting URL)

If none are set, the system defaults to `https://gen-lang-client-0046334557.web.app` - you should update this in `api/scrape-website.js` if needed.

## Verify It Worked

After updating, check your database:

```sql
SELECT id, name, preview_url, widget_url 
FROM businesses 
WHERE id = 'your-business-id';
```

Both URLs should now be populated!

