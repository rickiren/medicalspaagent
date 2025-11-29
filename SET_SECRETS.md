# Setting Firebase Secrets via Terminal

Follow these steps to set all required secrets for your Firebase Functions.

## Step 1: Set Each Secret

Run these commands one by one. Each will prompt you to enter the secret value:

```bash
# 1. Set Supabase URL
firebase functions:secrets:set SUPABASE_URL

# 2. Set Supabase Anonymous Key
firebase functions:secrets:set SUPABASE_ANON_KEY

# 3. Set Supabase Service Role Key (for storage uploads)
firebase functions:secrets:set SUPABASE_SERVICE_ROLE_KEY

# 4. Set Firecrawl API Key
firebase functions:secrets:set FIRECRAWL_API_KEY

# 5. Set Gemini API Key
firebase functions:secrets:set GEMINI_API_KEY
```

## Step 2: What to Enter

When prompted, paste your actual values:

- **SUPABASE_URL**: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
- **SUPABASE_ANON_KEY**: Your Supabase anonymous key (starts with `eyJ...`)
- **SUPABASE_SERVICE_ROLE_KEY**: Your Supabase service role key (starts with `eyJ...`)
- **FIRECRAWL_API_KEY**: Your Firecrawl API key (starts with `fc-...`)
- **GEMINI_API_KEY**: Your Google Gemini API key (starts with `AIza...`)

## Step 3: Redeploy Function

After setting all secrets, you need to redeploy the function so it can access them:

```bash
firebase deploy --only functions
```

The function code has been updated to declare these secrets, so after redeployment, they'll be available as environment variables.

## Alternative: Set from File

If you have a file with your secrets, you can also set them from a file:

```bash
echo "your-secret-value" | firebase functions:secrets:set SUPABASE_URL --data-file -
```

## Verify Secrets Are Set

To list all secrets:

```bash
firebase functions:secrets:access
```

## Notes

- Secrets are encrypted and stored securely by Firebase
- They're automatically available as environment variables in your function
- You don't need to manually set `process.env` - Firebase handles this
- After setting secrets, you MUST redeploy the function for changes to take effect

