# Setting Up Custom Domain with Firebase Hosting

Your site is currently live at: **https://gen-lang-client-0046334557.web.app**

## Quick Setup via Firebase Console (Recommended)

### Step 1: Add Domain in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `gen-lang-client-0046334557`
3. Click **Hosting** in the left sidebar
4. Click **Add custom domain** button
5. Enter your domain name (e.g., `yourdomain.com` or `www.yourdomain.com`)
6. Click **Continue**

### Step 2: Verify Domain Ownership

Firebase will show you DNS records to add. You have two options:

**Option A: A Record (Root Domain)**
- Type: `A`
- Name: `@` (or leave blank)
- Value: The IP addresses Firebase provides (usually 2-4 IPs)

**Option B: CNAME (Subdomain like www)**
- Type: `CNAME`
- Name: `www` (or your subdomain)
- Value: The CNAME target Firebase provides (e.g., `gen-lang-client-0046334557.web.app`)

### Step 3: Add DNS Records

1. Go to your domain registrar (GoDaddy, Namecheap, Google Domains, etc.)
2. Find DNS Management / DNS Settings
3. Add the records Firebase provided
4. Save changes

### Step 4: Wait for Verification

- DNS changes can take 24-48 hours to propagate (usually much faster)
- Firebase will automatically verify when DNS is ready
- You'll get an email when verification is complete

### Step 5: SSL Certificate

- Firebase automatically provisions SSL certificates
- Once verified, your site will be available at `https://yourdomain.com`
- SSL is free and automatic!

## Setup via CLI (Alternative)

If you prefer command line:

```bash
# Add custom domain
firebase hosting:sites:create your-site-id

# Or add domain to existing site
firebase hosting:channel:deploy live --only hosting
```

## Current Status

Your site is already live and accessible at:
- **Firebase URL**: https://gen-lang-client-0046334557.web.app
- **Firebase URL (alt)**: https://gen-lang-client-0046334557.firebaseapp.com

## What Happens After Domain Setup

Once your custom domain is verified:
1. Your site will be accessible at `https://yourdomain.com`
2. The Firebase URLs will still work (they redirect)
3. SSL certificate is automatically provisioned
4. All API routes (`/api/**`) will work through your custom domain

## Multiple Domains

You can add multiple domains:
- `yourdomain.com` (root)
- `www.yourdomain.com` (www subdomain)
- `app.yourdomain.com` (app subdomain)

Firebase handles all of them!

## Troubleshooting

### DNS Not Propagating?
- Check DNS propagation: https://dnschecker.org
- Wait up to 48 hours (usually much faster)
- Make sure you added the correct records

### SSL Certificate Issues?
- Firebase automatically handles SSL
- Wait for domain verification first
- Check Firebase Console for SSL status

### Domain Not Working?
- Verify DNS records are correct
- Check Firebase Console for any errors
- Make sure domain is verified in Firebase

## Next Steps After Domain Setup

1. Update any hardcoded URLs in your code to use the new domain
2. Update Supabase database if you store URLs
3. Test all API endpoints with the new domain
4. Set up redirects if needed (Firebase handles this automatically)

