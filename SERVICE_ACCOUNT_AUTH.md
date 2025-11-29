# Service Account Authentication with OAuth

## How OAuth Works with Service Accounts

**You do NOT need to manually get OAuth tokens** - the `google-auth-library` handles this automatically!

### Automatic OAuth2 Flow

1. **Service Account JSON** contains:
   - Private key (for signing JWT tokens)
   - Client email (service account identity)
   - Project ID

2. **Google Auth Library** automatically:
   - Creates a JWT assertion using the private key
   - Exchanges it for an OAuth2 access token
   - Handles token refresh automatically
   - Manages token expiration (tokens last ~1 hour)

3. **Access Token** is what we use:
   - Bearer token format: `ya29.c.xxx...`
   - Automatically refreshed when expired
   - Used in `Authorization: Bearer <token>` headers

## Current Implementation

### Server-Side (Already Working ✅)
- `utils/geminiAuth.js` uses `GoogleAuth` from `google-auth-library`
- Automatically gets OAuth tokens from service account
- Used in:
  - `api/_lib/normalizer.js`
  - `api/_lib/previewNormalizer.js`
  - `api/_lib/businessExtractor.js`

### Client-Side (VoiceWidget - Updated ✅)
- Fetches OAuth token from `/api/gemini-token` endpoint
- Uses token for authentication
- **NO API key fallback** - service account is required

## Token Endpoint

The `/api/gemini-token` endpoint:
1. Reads service account JSON from `GOOGLE_APPLICATION_CREDENTIALS`
2. Uses `google-auth-library` to get OAuth token
3. Returns token to client

```javascript
// Server-side (api/gemini-token.js)
const token = await getGeminiAccessToken(); // Returns OAuth token
// Returns: { token: "ya29.c.xxx...", expiresIn: 3600 }
```

## VoiceWidget Authentication Flow

1. **Request token** from `/api/gemini-token`
2. **Use token** to initialize `GoogleGenAI`
3. **If token fails**, error is thrown (no fallback)
4. **Service account is required** - no API key option

## Important Notes

- ✅ OAuth tokens are automatically managed
- ✅ Tokens refresh automatically when expired
- ✅ No manual OAuth flow needed
- ✅ Service account JSON contains everything needed
- ❌ API keys are NOT used in VoiceWidget
- ❌ No fallback to API key

## Configuration Required

```bash
# .env.local
GOOGLE_APPLICATION_CREDENTIALS=./secrets/gemini-service-account.json
```

The service account JSON file must exist at the specified path.

## Testing

Run the test script to verify OAuth token generation:
```bash
node test-service-account.js
```

This will:
- ✅ Verify service account file exists
- ✅ Test OAuth token generation
- ✅ Test API call with OAuth token
- ✅ Confirm everything works

