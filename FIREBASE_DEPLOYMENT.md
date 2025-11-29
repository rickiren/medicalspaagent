# Firebase Deployment Guide

This guide will help you deploy the Serenity MedSpa Voice Agent to Firebase Hosting and Cloud Functions.

## Prerequisites

1. A Firebase account (sign up at https://firebase.google.com)
2. Firebase CLI installed:
   ```bash
   npm install -g firebase-tools
   ```
3. Supabase project with:
   - Database table `businesses` created
   - Storage bucket `screenshots` created (for screenshot storage)
4. API keys for:
   - Firecrawl API
   - Google Gemini API

## Step 1: Initialize Firebase

1. Login to Firebase:
   ```bash
   firebase login
   ```

2. Initialize Firebase in your project:
   ```bash
   firebase init
   ```
   
   Select:
   - ✅ Hosting
   - ✅ Functions
   
   When prompted:
   - Use an existing project or create a new one
   - Set public directory to `dist`
   - Configure as single-page app: **Yes**
   - Set up automatic builds: **No** (we'll build manually)
   - Install dependencies: **Yes**

## Step 2: Set Environment Variables

**Important**: Firebase Functions `config()` API is deprecated. Use environment variables/secrets instead.

### Option A: Using Firebase Secrets (Recommended for Production)

Set secrets via Firebase Console or CLI:

```bash
# Set secrets (will prompt for values)
firebase functions:secrets:set SUPABASE_URL
firebase functions:secrets:set SUPABASE_ANON_KEY
firebase functions:secrets:set SUPABASE_SERVICE_ROLE_KEY
firebase functions:secrets:set FIRECRAWL_API_KEY
firebase functions:secrets:set GEMINI_API_KEY
```

Or via Firebase Console:
1. Go to Firebase Console → Your Project → Functions
2. Click "Secrets" tab
3. Add each secret with its value

### Option B: Using .env file (Local Development)

Create `functions/.env` for local development:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FIRECRAWL_API_KEY=your_firecrawl_key
GEMINI_API_KEY=your_gemini_key
```

## Step 3: Create Supabase Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to Storage
3. Create a new bucket named `screenshots`
4. Set it to **Public** (so screenshots can be accessed via URL)
5. Set up a policy to allow uploads

## Step 4: Build the Application

Build your Vite application:

```bash
npm run build
```

This will create the `dist` directory with your static files.

## Step 5: Install Function Dependencies

Install dependencies for Cloud Functions:

```bash
cd functions
npm install
cd ..
```

## Step 6: Deploy to Firebase

Deploy both hosting and functions:

```bash
firebase deploy
```

Or deploy separately:

```bash
# Deploy hosting only
firebase deploy --only hosting

# Deploy functions only
firebase deploy --only functions

# Deploy both
firebase deploy --only hosting,functions
```

## Step 7: Verify Deployment

1. Check that your site is live at your Firebase Hosting URL
2. Test API routes:
   - `/api/businesses` - Should return list of businesses
   - `/api/businesses/[id]` - Should return a single business
   - `/api/scrape-website` - Should scrape and save to database

3. Test screenshot generation:
   - Try scraping a website
   - Check Supabase Storage bucket for the screenshot
   - Verify the screenshot URL is saved in the database

## Local Development

### Run Firebase Emulators

```bash
firebase emulators:start
```

This will start:
- Hosting emulator (serves your `dist` folder)
- Functions emulator (runs your Cloud Functions locally)

### Development Workflow

1. Start Vite dev server for frontend:
   ```bash
   npm run dev
   ```

2. For testing functions locally, use the emulator:
   ```bash
   firebase emulators:start --only functions
   ```

## Troubleshooting

### Screenshots not working
- Verify Supabase Storage bucket `screenshots` exists and is public
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly in Firebase Functions config
- Check Firebase Functions logs: `firebase functions:log`

### API routes returning 500 errors
- Verify all environment variables are set in Firebase Functions config
- Check Firebase Functions logs
- Ensure Supabase table structure matches expected schema

### Playwright timeout errors
- Playwright on Firebase Functions may have size/timeout limitations
- Consider using a screenshot service API for production if you hit limits
- Increase function timeout in `firebase.json` if needed

### Function deployment fails
- Check that all dependencies in `functions/package.json` are compatible
- Ensure Node.js version matches (set to 20 in `firebase.json`)
- Check function logs for specific errors

## Architecture Notes

- **Hosting**: Static files served from `dist` directory via Firebase Hosting
- **API Routes**: All API routes handled by Firebase Cloud Functions via Express
- **Screenshots**: Stored in Supabase Storage
- **Database**: All data stored in Supabase PostgreSQL
- **Rewrites**: API routes (`/api/**`) are rewritten to Cloud Functions

## Environment Variables

Firebase Functions access environment variables via `process.env`. 

**For Production:**
- Use Firebase Secrets (recommended): `firebase functions:secrets:set VARIABLE_NAME`
- Or set in Firebase Console → Functions → Environment Variables

**For Local Development:**
- Use `.env` file in `functions/` directory
- Or set in your shell: `export VARIABLE_NAME=value`

**Note**: The deprecated `functions.config()` API has been removed from the code. All configuration now uses `process.env`.

## Support

For issues specific to:
- **Firebase**: Check Firebase documentation or support
- **Supabase**: Check Supabase documentation
- **Playwright**: Check Playwright documentation for serverless deployment

