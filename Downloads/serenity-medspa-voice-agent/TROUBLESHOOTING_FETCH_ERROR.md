# Troubleshooting "Normalization failed: fetch failed" Error

## What This Error Means

The error "Normalization failed: fetch failed" occurs when the system cannot connect to Google's Gemini API to process the scraped website data.

## Common Causes & Solutions

### 1. **Missing or Invalid Gemini API Key**

**Check:**
- Go to Firebase Console → Your Project → Functions → Secrets
- Verify `GEMINI_API_KEY` is set and correct
- Make sure there are no extra spaces or quotes

**Solution:**
1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to Firebase Functions secrets:
   ```bash
   firebase functions:secrets:set GEMINI_API_KEY
   ```
3. **Redeploy** your functions:
   ```bash
   firebase deploy --only functions
   ```

### 2. **Network/Connectivity Issues**

**Check:**
- Is your Firebase Functions deployment able to reach external APIs?
- Are there any firewall restrictions?

**Solution:**
- Check Firebase Functions logs for detailed error messages:
  ```bash
  firebase functions:log
  ```
- The system will now automatically try a fallback model if the experimental one fails

### 3. **API Model Availability**

The system uses `gemini-2.0-flash-exp` (experimental). If this model is unavailable, it will automatically fall back to `gemini-1.5-flash`.

**Check:**
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey) to verify model availability
- Check if your API key has access to the models

### 4. **Request Timeout**

The API request has a 60-second timeout. Very large websites might exceed this.

**Solution:**
- The system now has better timeout handling
- Check Firebase Functions logs to see if timeout is the issue:
  ```bash
  firebase functions:log
  ```

## Improved Error Messages

The system now provides more detailed error messages:

- **"Network error"** → Check internet connection and API key
- **"Request timed out"** → The API took too long to respond
- **"Gemini API error (400/401/403)"** → API key issue or invalid request
- **"Invalid response from Gemini API"** → API returned unexpected data

## How to Debug

1. **Check Firebase Functions Logs:**
   - Use Firebase CLI:
     ```bash
     firebase functions:log
     ```
   - Or go to Firebase Console → Your Project → Functions → Logs
   - Look for `[NORMALIZER]` or `[PREVIEW-NORMALIZER]` log messages
   - These will show exactly where the error occurred

2. **Test API Key:**
   ```bash
   curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY" \
     -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
   ```

3. **Check Environment Variables:**
   - Verify secrets are set:
     ```bash
     firebase functions:secrets:access GEMINI_API_KEY
     ```
   - Or check in Firebase Console → Functions → Configuration

## What Was Fixed

✅ Added better error handling with detailed messages  
✅ Added automatic fallback to stable model (`gemini-1.5-flash`)  
✅ Added 60-second timeout with proper handling  
✅ Added validation for API responses  
✅ Added logging for easier debugging  

## Still Having Issues?

1. Check Firebase Functions logs for the exact error:
   ```bash
   firebase functions:log
   ```
2. Verify your `GEMINI_API_KEY` is correct and set as a Firebase secret
3. Try scraping a different, simpler website
4. Check if your API key has quota/rate limits

