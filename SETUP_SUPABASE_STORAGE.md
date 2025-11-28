# Setup Supabase Storage for Screenshots

## Step 1: Create the Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Storage** in the left sidebar
4. Click **"New bucket"**
5. Configure:
   - **Name:** `screenshots`
   - **Public bucket:** ✅ **Check this box** (IMPORTANT - makes images accessible via URL)
   - **File size limit:** Leave default or set to 10MB
   - **Allowed MIME types:** `image/png, image/jpeg` (optional)
6. Click **"Create bucket"**

## Step 2: Set Storage Policies (Optional but Recommended)

1. In the Storage section, click on the `screenshots` bucket
2. Go to **"Policies"** tab
3. Add a policy for public read access:
   - **Policy name:** `Public read access`
   - **Allowed operation:** `SELECT` (read)
   - **Target roles:** `public`
   - **Policy definition:** 
     ```sql
     true
     ```
4. Add a policy for authenticated uploads (if using service role):
   - **Policy name:** `Service role upload`
   - **Allowed operation:** `INSERT` and `UPDATE`
   - **Target roles:** `service_role`
   - **Policy definition:**
     ```sql
     true
     ```

## Step 3: Add Service Role Key to Vercel

1. Go to Supabase Dashboard → **Settings** → **API**
2. Copy the **"service_role"** key (NOT the anon key - this one has more permissions)
3. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
4. Add:
   - **Name:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** Paste the service_role key
   - **Environment:** Select all (Production, Preview, Development)
5. Click **"Save"**

## Step 4: Redeploy on Vercel

After adding the environment variable:
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Select **"Redeploy"**

## Step 5: Test

1. Go to your dashboard
2. Click **"Scrape Website"** for a business
3. Wait for the scrape to complete
4. The screenshot should now be saved to Supabase Storage
5. Check the `screenshots` bucket in Supabase to verify the file was uploaded

## Troubleshooting

**Screenshots still not showing?**
- Check Vercel logs for errors
- Verify the bucket is **public**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
- Check Supabase Storage → `screenshots` bucket to see if files are being uploaded

**Getting permission errors?**
- Make sure the bucket is set to **public**
- Check that storage policies allow public read access

