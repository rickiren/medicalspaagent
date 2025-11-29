# Vercel Deployment Debug Guide

## Issue: Code not updating on Vercel

If your local code works but Vercel doesn't show the changes:

### Step 1: Verify GitHub has latest code
```bash
git log --oneline -3
# Should show your latest commits
```

### Step 2: Check Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Find your project: `medicalspaagent`
3. Go to **Deployments** tab
4. Check the **latest deployment**:
   - Does it show the latest commit hash? (should match `git log`)
   - Click on the deployment → **Build Logs**
   - Look for any errors or warnings

### Step 3: Force a Clean Rebuild

1. In Vercel Dashboard → **Deployments**
2. Click **"..."** (three dots) on latest deployment
3. Click **"Redeploy"**
4. **IMPORTANT**: Check the box **"Use existing Build Cache"** and **UNCHECK IT**
5. Click **"Redeploy"**

### Step 4: Verify Build Settings

Go to **Settings** → **General**:

- **Framework Preset**: Should be **"Vite"**
- **Root Directory**: Should be **"."** (root)
- **Build Command**: Should be `npm run build`
- **Output Directory**: Should be `dist`
- **Install Command**: Should be `npm install`

### Step 5: Check Build Logs

In the deployment, check:
1. Does it say "Building..." and complete successfully?
2. Are there any TypeScript errors?
3. Are there any missing dependencies?
4. Does it show "Build Completed" with a green checkmark?

### Step 6: Clear Browser Cache

After deployment:
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Or open in incognito/private window
3. Or clear browser cache completely

### Step 7: Verify Files Are Built

Check the build output in Vercel:
- Go to deployment → **Source** tab
- Look for `dist/index.html`
- Check if `dist/assets/` contains the built JS files

### Common Issues:

1. **Vercel using old build cache**
   - Solution: Redeploy with cache disabled (Step 3)

2. **Build failing silently**
   - Solution: Check build logs for errors

3. **Wrong branch deployed**
   - Solution: Verify Vercel is connected to `main` branch

4. **Environment variables missing**
   - Solution: Check Settings → Environment Variables

5. **Framework preset wrong**
   - Solution: Change to "Vite" in Settings → General

## Quick Fix: Manual Redeploy

1. Go to Vercel Dashboard
2. Click on your project
3. Go to **Deployments**
4. Click **"..."** on latest deployment
5. Click **"Redeploy"**
6. **UNCHECK** "Use existing Build Cache"
7. Click **"Redeploy"**

This will force a complete rebuild from scratch.

