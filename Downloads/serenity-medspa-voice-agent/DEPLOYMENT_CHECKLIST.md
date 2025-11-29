# Firebase Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. Supabase Storage Bucket
- [ ] Go to Supabase Dashboard → Storage
- [ ] Create a new bucket named `screenshots`
- [ ] Set bucket to **Public**
- [ ] (Optional) Set up storage policies for uploads

### 2. Environment Variables
Set these as Firebase Functions secrets:

- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for storage uploads)
- [ ] `FIRECRAWL_API_KEY` - Firecrawl API key
- [ ] `GEMINI_API_KEY` - Google Gemini API key

Set via CLI:
```bash
firebase functions:secrets:set SUPABASE_URL
firebase functions:secrets:set SUPABASE_ANON_KEY
firebase functions:secrets:set SUPABASE_SERVICE_ROLE_KEY
firebase functions:secrets:set FIRECRAWL_API_KEY
firebase functions:secrets:set GEMINI_API_KEY
```

### 3. Database
- [ ] Ensure `businesses` table exists with all required columns:
  - `id` (text, primary key)
  - `name` (text)
  - `domain` (text)
  - `config_json` (jsonb)
  - `preview_data_json` (jsonb)
  - `contact_info_json` (jsonb)
  - `preview_screenshot_url` (text)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

## 🚀 Deployment Steps

### Option 1: Firebase CLI
```bash
# Login
firebase login

# Build the application
npm run build

# Deploy (all)
firebase deploy

# Deploy hosting only
firebase deploy --only hosting

# Deploy functions only
firebase deploy --only functions
```

### Option 2: GitHub Integration
1. Connect Firebase to GitHub (if using GitHub Actions)
2. Push code to GitHub
3. Firebase will auto-deploy (if configured)

## ✅ Post-Deployment Verification

### Test API Routes
- [ ] `GET /api/businesses` - Should return list
- [ ] `GET /api/businesses/[id]` - Should return single business
- [ ] `GET /api/business/[id]/config` - Should return config JSON
- [ ] `POST /api/scrape-website` - Should scrape and save

### Test Screenshot Functionality
- [ ] Scrape a website
- [ ] Check Supabase Storage bucket for screenshot
- [ ] Verify screenshot URL in database
- [ ] Verify screenshot displays in preview

### Test Widget
- [ ] Load widget with `businessId` prop
- [ ] Verify config loads from API
- [ ] Test voice interaction
- [ ] Test booking function

## 📝 Important Notes

1. **Screenshots Storage**:
   - Development: Saved to `public/screenshots/`
   - Production (Firebase): Saved to Supabase Storage bucket `screenshots`

2. **API Routes**:
   - All routes handled by Firebase Cloud Functions
   - Located in `/functions` directory
   - Function URL: `https://us-central1-gen-lang-client-0046334557.cloudfunctions.net/api`

3. **Hosting**:
   - Static files served from `dist` directory
   - Hosting URL: `https://gen-lang-client-0046334557.web.app`
   - All routes rewrite to `/index.html` for SPA routing

## 🐛 Troubleshooting

### Screenshots not saving
- Check Supabase Storage bucket exists and is public
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set as Firebase secret
- Check Firebase Functions logs: `firebase functions:log`

### API routes returning 500
- Verify all environment variables are set as Firebase secrets
- Check Supabase connection
- Review Firebase Functions logs

### Build errors
- Check build logs in terminal
- Verify all dependencies are installed
- Check TypeScript compilation errors

## 📚 Documentation

- Full deployment guide: See `FIREBASE_DEPLOYMENT.md`
- API documentation: See `api/README.md`
- Configuration guide: See `CONFIG_USAGE.md`
