# Deployment Steps - GitHub to Vercel

## ✅ Step 1: Code Pushed to GitHub
Your code has been successfully pushed to: `https://github.com/rickiren/medicalspaagent.git`

## 🚀 Step 2: Connect GitHub to Vercel

### Option A: If you already have a Vercel project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project: `medicalspaagent` (or similar)
3. Go to **Settings** → **Git**
4. Verify it's connected to: `rickiren/medicalspaagent`
5. If not connected, click **Connect Git Repository** and select your repo

### Option B: Create a new Vercel project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import from GitHub: `rickiren/medicalspaagent`
4. Vercel will auto-detect it's a Vite project
5. Click **Deploy** (we'll add environment variables next)

## 🔐 Step 3: Set Environment Variables in Vercel

Go to your Vercel project → **Settings** → **Environment Variables**

Add these variables (for **Production**, **Preview**, and **Development**):

### Server-side (API routes) - NO prefix:
```
SUPABASE_URL=https://qrnbuerdzppfbgzgoncp.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFybmJ1ZXJkenBwZmJnemdvbmNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjQ3MDAsImV4cCI6MjA3OTc0MDcwMH0.ya6K3otkisSevvX2LpnTwCjHb1796IyiJ0Vkx3Xik7Q
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
GEMINI_API_KEY=AIzaSyA7cEFNSDW3QF5BKksAh4Tz7ht_tRYYxlA
FIRECRAWL_API_KEY=fc-cb9089570df74df595b307036cb2e868
SCREENSHOTONE_SECRET_KEY=wzQ5CwGPd5r
```

### Client-side (React app) - NEEDS VITE_ prefix:
```
VITE_SUPABASE_URL=https://qrnbuerdzppfbgzgoncp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFybmJ1ZXJkenBwZmJnemdvbmNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjQ3MDAsImV4cCI6MjA3OTc0MDcwMH0.ya6K3otkisSevvX2LpnTwCjHb1796IyiJ0Vkx3Xik7Q
VITE_SCREENSHOTONE_PUBLIC_KEY=7JL3Qryis594lg
```

**Important Notes:**
- Select **Production**, **Preview**, and **Development** for each variable
- After adding variables, you MUST redeploy (see Step 4)
- Get `SUPABASE_SERVICE_ROLE_KEY` from Supabase Dashboard → Settings → API

## 🔄 Step 4: Trigger Deployment

After adding environment variables:

1. Go to **Deployments** tab
2. Click **...** (three dots) on the latest deployment
3. Click **Redeploy**
4. OR push a new commit to trigger automatic deployment

## ✅ Step 5: Verify Deployment Settings

Go to **Settings** → **General** and verify:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

## 🧪 Step 6: Test Your Deployment

After deployment completes, test these URLs:

1. **Main Landing Page:**
   - `https://your-project.vercel.app/`

2. **Business Preview Pages:**
   - `https://your-project.vercel.app/business/blue-pearl-dentistry`
   - `https://your-project.vercel.app/business/self-care-la`
   - (Use slugified business names)

3. **API Endpoints:**
   - `https://your-project.vercel.app/api/businesses` (should return JSON)

## 🔍 Troubleshooting

### If routes return 404:
- Verify `vercel.json` exists in root (✅ it does)
- Check that rewrite rules are correct (✅ they are)
- Redeploy after any changes

### If environment variables don't work:
- Make sure you added them for **all environments** (Production, Preview, Development)
- Redeploy after adding variables
- Check Vercel Function Logs for errors

### If build fails:
- Check **Deployments** → **Build Logs**
- Common issues:
  - Missing dependencies → Check `package.json` is committed
  - TypeScript errors → Check build logs
  - Import errors → Verify file paths

## 📝 Quick Checklist

- [ ] Code pushed to GitHub ✅
- [ ] Vercel project connected to GitHub repo
- [ ] Environment variables added (with VITE_ prefix for client-side)
- [ ] Deployment triggered/redeployed
- [ ] Build completes successfully
- [ ] Routes work (test preview pages)
- [ ] API endpoints work (test /api/businesses)

## 🎉 You're Done!

Once deployed, your preview links will work at:
`https://your-project.vercel.app/business/{business-name}`

