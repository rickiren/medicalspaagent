# Instagram Outreach Bot Setup

This guide will help you set up and use the Instagram Outreach Bot for your Cynthia AI project.

## Overview

The Instagram Outreach Bot is a fully automated system that:
- Uses Supabase to store and track Instagram outreach data
- Runs locally on your Mac using ADB to control an Android emulator
- Automatically sends Instagram DMs based on lead data

## Step 1: Database Setup

Run the SQL migration to add the required columns to your leads table:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the contents of `add-instagram-outreach-columns.sql`
6. Click **Run** (or press Cmd/Ctrl + Enter)

This will add:
- `instagram_handle` (text) - Instagram handle without @
- `personalized_message` (text) - Message to send via DM
- `outreach_status` (text) - Status: "pending", "sent", or "failed"

## Step 2: Install ADB

Install Android Platform Tools (ADB) on your Mac:

```bash
brew install android-platform-tools
```

Verify installation:
```bash
adb --version
```

## Step 3: Set Up Android Emulator

1. Install Android Studio
2. Create and start an Android Virtual Device (AVD)
3. Install Instagram from Google Play Store
4. Log in to your Instagram account on the emulator

## Step 4: Verify ADB Connection

Check that your emulator is connected:

```bash
adb devices
```

You should see your emulator listed. If not, make sure the emulator is running.

## Step 5: Configure Screen Coordinates

The bot uses screen coordinates to interact with Instagram. You'll need to update the coordinates in `scripts/instagramOutreachBot.js` based on your emulator's screen size.

Open `scripts/instagramOutreachBot.js` and update the `coords` object:

```javascript
const coords = {
  search_button: { x: 100, y: 200 },      // Instagram search button
  search_input: { x: 200, y: 150 },      // Search input field
  first_result: { x: 200, y: 350 },      // First search result
  message_button: { x: 900, y: 200 },     // Message button on profile
  message_input: { x: 300, y: 1700 },     // Message input field
  send_button: { x: 950, y: 1700 },      // Send button
  back_button: { x: 50, y: 100 }         // Back button
};
```

**Tip**: Use `adb shell getevent` or screenshot tools to find the correct coordinates for your emulator.

## Step 6: Add Lead Data

Add Instagram outreach data to your leads in Supabase:

1. Go to Supabase Dashboard → Table Editor → leads
2. For each lead you want to outreach:
   - Set `instagram_handle` (e.g., "businessname" without @)
   - Set `personalized_message` (the DM message to send)
   - Set `outreach_status` to "pending" (or leave as default)

You can also update leads via SQL:

```sql
UPDATE leads 
SET 
  instagram_handle = 'businessname',
  personalized_message = 'Hi! I noticed your business...',
  outreach_status = 'pending'
WHERE id = 'your-lead-id';
```

## Step 7: Run the Bot

Start the bot script:

```bash
node scripts/instagramOutreachBot.js
```

The bot will:
1. Continuously check for pending leads
2. Process each lead one at a time
3. Send Instagram DMs using ADB commands
4. Mark leads as "sent" or "failed" in Supabase
5. Wait 10 seconds between leads (to avoid rate limiting)

Press `Ctrl+C` to stop the bot.

## Step 8: Monitor in Dashboard

View Instagram outreach status in your Cynthia dashboard:

1. Start your development server: `npm run dev`
2. Open the dashboard
3. Click the "Instagram Outreach" tab
4. View all leads with Instagram outreach data
5. See status counts (pending, sent, failed)

## API Endpoints

The system includes two API endpoints:

### GET /api/instagram-outreach/get-next-lead
Returns the next pending lead for Instagram outreach.

**Response:**
```json
{
  "lead": {
    "id": "lead-id",
    "instagram_handle": "businessname",
    "personalized_message": "Your message here"
  }
}
```

Or `{ "lead": null }` if no pending leads.

### POST /api/instagram-outreach/mark-sent
Marks a lead as sent or failed.

**Request Body:**
```json
{
  "id": "lead-id",
  "status": "sent"  // or "failed"
}
```

**Response:**
```json
{
  "success": true,
  "id": "lead-id"
}
```

## Troubleshooting

### "No Android devices found"
- Make sure your Android emulator is running
- Run `adb devices` to verify connection
- Restart ADB: `adb kill-server && adb start-server`

### "Failed to tap" or coordinates not working
- Update the `coords` object in the script
- Make sure your emulator screen resolution matches your coordinate assumptions
- Test coordinates manually using: `adb shell input tap X Y`

### "Supabase credentials not configured"
- Make sure `.env.local` exists in the project root
- Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to `.env.local`

### Bot sends to wrong account or wrong message
- Double-check your lead data in Supabase
- Verify `instagram_handle` doesn't include @ symbol
- Check `personalized_message` content

### Instagram rate limiting
- The bot waits 10 seconds between leads
- If you hit rate limits, increase the wait time in the script
- Consider running the bot during off-peak hours

## Notes

- The bot runs continuously until stopped (Ctrl+C)
- It processes leads in order of `created_at` (oldest first)
- Failed leads are marked as "failed" but can be retried by setting status back to "pending"
- Screen coordinates are device-specific and must be calibrated for your emulator

## Next Steps

1. Test with a single lead first
2. Calibrate screen coordinates
3. Scale up to multiple leads
4. Monitor success rates in the dashboard
5. Adjust message personalization based on results

