# Vercel Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. Supabase Storage Bucket
- [ ] Go to Supabase Dashboard → Storage
- [ ] Create a new bucket named `screenshots`
- [ ] Set bucket to **Public**
- [ ] (Optional) Set up storage policies for uploads

### 2. Environment Variables
Add these to your Vercel project settings:

- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for storage uploads)
- [ ] `FIRECRAWL_API_KEY` - Firecrawl API key
- [ ] `GEMINI_API_KEY` - Google Gemini API key

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

### Option 1: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (preview)
vercel

# Deploy (production)
vercel --prod
```

### Option 2: GitHub Integration
1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import repository
4. Vercel auto-detects Vite
5. Add environment variables
6. Deploy!

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

1. **Playwright on Vercel**: 
   - First screenshot may be slow (browser installation)
   - Requires Vercel Pro plan for larger functions (3GB memory)
   - Consider screenshot service API for production if hitting limits

2. **Screenshots Storage**:
   - Development: Saved to `public/screenshots/`
   - Production (Vercel): Saved to Supabase Storage bucket `screenshots`

3. **API Routes**:
   - All routes converted to Vercel serverless functions
   - Located in `/api` directory
   - Max duration: 60 seconds
   - Memory: 3008 MB (Pro plan)

## 🐛 Troubleshooting

### Screenshots not saving
- Check Supabase Storage bucket exists and is public
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check Vercel function logs

### API routes returning 500
- Verify all environment variables are set
- Check Supabase connection
- Review Vercel function logs

### Playwright errors
- Check function memory allocation
- Verify browser installation
- Consider increasing timeout

## 📚 Documentation

- Full deployment guide: See `VERCEL_DEPLOYMENT.md`
- API documentation: See `api/README.md`
- Configuration guide: See `CONFIG_USAGE.md`

