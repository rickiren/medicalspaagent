# Deploy OpenAI Realtime Proxy Cloud Function

This guide explains how to deploy the OpenAI Realtime WebSocket proxy cloud function.

## Prerequisites

1. Firebase CLI installed and authenticated
2. OpenAI API key
3. (Optional) OpenAI Project ID

## Setup Steps

### 1. Install Dependencies

Navigate to the functions directory and install dependencies:

```bash
cd functions
npm install
```

### 2. Set Firebase Secrets

Set the required secrets for the function:

```bash
# Set OpenAI API Key
firebase functions:secrets:set OPENAI_API_KEY

# (Optional) Set OpenAI Project ID if you have one
firebase functions:secrets:set OPENAI_PROJECT_ID
```

When prompted, enter your OpenAI API key and project ID (if applicable).

### 3. Deploy the Function

Deploy the OpenAI Realtime proxy function:

```bash
# Deploy only the OpenAI proxy function
firebase deploy --only functions:openaiRealtimeProxy

# Or deploy all functions
firebase deploy --only functions
```

### 4. Verify Deployment

After deployment, the function will be available at:
- `https://YOUR_PROJECT_ID.cloudfunctions.net/openaiRealtimeProxy`
- Or via Firebase Hosting rewrite: `/api/openai-realtime-proxy`

## Testing

The function should handle WebSocket connections from the frontend. The VoiceWidget component will automatically connect to `/api/openai-realtime-proxy` when using OpenAI Realtime API.

## Troubleshooting

### Function Not Found
- Make sure you've deployed the function: `firebase deploy --only functions:openaiRealtimeProxy`
- Check that the function name matches in `firebase.json` rewrites

### WebSocket Connection Failed
- Verify secrets are set: `firebase functions:secrets:access OPENAI_API_KEY`
- Check function logs: `firebase functions:log --only openaiRealtimeProxy`
- Ensure the function is using Cloud Functions 2nd gen (v2) which supports WebSockets

### Authentication Errors
- Verify your OpenAI API key is valid
- Check that the secret is properly set and accessible

## Function Configuration

The function is configured with:
- **Timeout**: 3600 seconds (1 hour) for long-lived WebSocket connections
- **Memory**: 512MiB
- **Min Instances**: 0 (scales to zero when not in use)
- **Max Instances**: 10
- **Concurrency**: 80

## Notes

- This function proxies WebSocket connections because browsers cannot send Authorization headers directly to OpenAI
- The function runs on Cloud Run (via Firebase Functions 2nd gen) which supports WebSocket connections
- All WebSocket messages are forwarded bidirectionally between the client and OpenAI

