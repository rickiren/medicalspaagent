# Deployment Steps - GitHub to Firebase

## ✅ Step 1: Code Pushed to GitHub
Your code has been successfully pushed to: `https://github.com/rickiren/medicalspaagent.git`

## 🚀 Step 2: Deploy to Firebase

### Using Firebase CLI

1. **Login to Firebase:**
   ```bash
   firebase login
   ```

2. **Build the application:**
   ```bash
   npm run build
   ```

3. **Deploy to Firebase:**
   ```bash
   firebase deploy
   ```

   Or deploy separately:
   ```bash
   # Deploy hosting only
   firebase deploy --only hosting
   
   # Deploy functions only
   firebase deploy --only functions
   ```

## 🔐 Step 3: Set Environment Variables in Firebase

### For Firebase Functions (API routes)

Set secrets via Firebase CLI:
```bash
firebase functions:secrets:set SUPABASE_URL
firebase functions:secrets:set SUPABASE_ANON_KEY
firebase functions:secrets:set SUPABASE_SERVICE_ROLE_KEY
firebase functions:secrets:set GEMINI_API_KEY
firebase functions:secrets:set FIRECRAWL_API_KEY
```

Or via Firebase Console:
1. Go to Firebase Console → Your Project → Functions
2. Click "Secrets" tab
3. Add each secret with its value

### For Client-side (React app)

Add these to your `.env` file for local development, or set them in your build process:

```
VITE_SUPABASE_URL=https://qrnbuerdzppfbgzgoncp.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SCREENSHOTONE_PUBLIC_KEY=your_key_here
```

**Note:** For production, these should be set during the build process or via Firebase Hosting environment variables.

## 🔄 Step 4: Redeploy After Environment Changes

After adding environment variables:

1. Redeploy functions:
   ```bash
   firebase deploy --only functions
   ```

2. Or redeploy everything:
   ```bash
   firebase deploy
   ```

## ✅ Step 5: Verify Deployment Settings

Your Firebase project is configured in `firebase.json`:
- **Hosting:** Serves from `dist` directory
- **Functions:** Located in `functions` directory
- **Project ID:** `gen-lang-client-0046334557`

## 🧪 Step 6: Test Your Deployment

After deployment completes, test these URLs:

1. **Main Landing Page:**
   - `https://gen-lang-client-0046334557.web.app/`
   - `https://gen-lang-client-0046334557.firebaseapp.com/`

2. **Business Preview Pages:**
   - `https://gen-lang-client-0046334557.web.app/preview/{business-id}`
   - `https://gen-lang-client-0046334557.web.app/widget/{business-id}`

3. **API Endpoints:**
   - `https://us-central1-gen-lang-client-0046334557.cloudfunctions.net/api/businesses`

## 🔍 Troubleshooting

### If routes return 404:
- Verify `firebase.json` has correct rewrite rules
- Check that `dist` directory was built correctly
- Ensure single-page app configuration is enabled

### If environment variables don't work:
- Make sure you set secrets for Firebase Functions
- Redeploy functions after adding secrets
- Check Firebase Functions logs: `firebase functions:log`

### If build fails:
- Check build logs in terminal
- Common issues:
  - Missing dependencies → Run `npm install`
  - TypeScript errors → Check build output
  - Import errors → Verify file paths

## 📝 Quick Checklist

- [ ] Code pushed to GitHub ✅
- [ ] Firebase project initialized
- [ ] Environment variables/secrets added
- [ ] Application built (`npm run build`)
- [ ] Deployment triggered (`firebase deploy`)
- [ ] Build completes successfully
- [ ] Routes work (test preview pages)
- [ ] API endpoints work (test /api/businesses)

## 🎉 You're Done!

Once deployed, your preview links will work at:
`https://gen-lang-client-0046334557.web.app/preview/{business-id}`
