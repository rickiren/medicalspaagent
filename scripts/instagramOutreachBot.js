#!/usr/bin/env node

/**
 * Instagram Outreach Bot
 * 
 * This script runs locally on your Mac and uses ADB to control an Android emulator
 * to send Instagram DMs automatically based on data from Supabase.
 * 
 * Prerequisites:
 * 1. Install ADB: brew install android-platform-tools
 * 2. Start Android emulator
 * 3. Verify connection: adb devices
 * 4. Make sure Instagram is installed and logged in on the emulator
 * 5. Configure screen coordinates in the coords object below
 * 
 * Run: node scripts/instagramOutreachBot.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
try {
  const envContent = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });
  Object.assign(process.env, envVars);
} catch (err) {
  console.error('❌ Error reading .env.local:', err.message);
  console.error('Make sure .env.local exists with SUPABASE_URL and SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Need: SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Screen coordinates - Configured for your Android emulator
const coords = {
  search_button: { x: 758, y: 2276 },     // bottom nav search icon
  search_input: { x: 397, y: 125 },       // search bar
  first_result: { x: 498, y: 437 },       // username in search results
  message_button: { x: 529, y: 684 },     // "Message" button on profile
  message_input: { x: 526, y: 2231 },     // text input box in DM screen
  send_button: { x: 972, y: 2249 },       // send button in DM screen
  back_button: { x: 73, y: 134 }          // top-left back arrow
};

// ADB abstraction functions
function tap(x, y) {
  try {
    execSync(`adb shell input tap ${x} ${y}`, { stdio: 'inherit' });
  } catch (error) {
    throw new Error(`Failed to tap at (${x}, ${y}): ${error.message}`);
  }
}

function typeText(text) {
  try {
    // Escape special characters and replace spaces with %s
    const safe = text.replace(/ /g, '%s').replace(/[&$`"\\]/g, '\\$&');
    execSync(`adb shell input text "${safe}"`, { stdio: 'inherit' });
  } catch (error) {
    throw new Error(`Failed to type text: ${error.message}`);
  }
}

function swipe(x1, y1, x2, y2, duration = 300) {
  try {
    execSync(`adb shell input swipe ${x1} ${y1} ${x2} ${y2} ${duration}`, { stdio: 'inherit' });
  } catch (error) {
    throw new Error(`Failed to swipe: ${error.message}`);
  }
}

function pressKey(keycode) {
  try {
    execSync(`adb shell input keyevent ${keycode}`, { stdio: 'inherit' });
  } catch (error) {
    throw new Error(`Failed to press key ${keycode}: ${error.message}`);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Check if ADB device is connected
function checkAdbConnection() {
  try {
    const output = execSync('adb devices', { encoding: 'utf-8' });
    const lines = output.trim().split('\n').slice(1); // Skip first line "List of devices attached"
    const devices = lines.filter(line => line.trim() && line.includes('device'));
    
    if (devices.length === 0) {
      console.error('❌ No Android devices found. Make sure your emulator is running and connected.');
      console.error('Run: adb devices');
      return false;
    }
    
    console.log(`✅ Found ${devices.length} device(s) connected`);
    return true;
  } catch (error) {
    console.error('❌ Error checking ADB connection:', error.message);
    console.error('Make sure ADB is installed: brew install android-platform-tools');
    return false;
  }
}

// Get next pending lead from Supabase
async function getNextInstagramLead() {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('id, instagram_handle, personalized_message')
      .eq('outreach_status', 'pending')
      .not('instagram_handle', 'is', null)
      .not('personalized_message', 'is', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('❌ Error fetching next lead:', error.message);
    throw error;
  }
}

// Mark lead as sent or failed
async function markInstagramLeadSent(id, status = 'sent') {
  try {
    const { error } = await supabase
      .from('leads')
      .update({ outreach_status: status })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`❌ Error marking lead ${id} as ${status}:`, error.message);
    throw error;
  }
}

// "send dm" flow - reusable function for sending Instagram DMs
// This flow can be used in other scripts
async function sendDM(handle, message) {
  try {
    // Step 1: Open Instagram search
    console.log('   → Opening search...');
    tap(coords.search_button.x, coords.search_button.y);
    await sleep(2000);

    // Step 2: Tap search input
    console.log('   → Tapping search input...');
    tap(coords.search_input.x, coords.search_input.y);
    await sleep(1000);

    // Step 3: Type Instagram handle (remove @ if present)
    const cleanHandle = handle.replace('@', '').trim();
    console.log(`   → Typing handle: @${cleanHandle}`);
    typeText(cleanHandle);
    await sleep(2000);

    // Step 4: Press Enter to search
    console.log('   → Pressing Enter to search...');
    pressKey(66); // ENTER key
    await sleep(3000);

    // Step 5: Tap first result
    console.log('   → Tapping first search result...');
    tap(coords.first_result.x, coords.first_result.y);
    await sleep(3000);

    // Step 6: Tap Message button
    console.log('   → Tapping Message button...');
    tap(coords.message_button.x, coords.message_button.y);
    await sleep(3000);

    // Step 7: Type message
    console.log(`   → Typing message: "${message}"`);
    tap(coords.message_input.x, coords.message_input.y);
    await sleep(1000);
    typeText(message);
    await sleep(1500);

    // Step 8: Tap send button
    console.log('   → Tapping send button...');
    tap(coords.send_button.x, coords.send_button.y);
    await sleep(2000);

    // Step 9: Navigate back (tap back button three times to return to home)
    console.log('   → Navigating back...');
    tap(coords.back_button.x, coords.back_button.y);
    await sleep(1000);
    tap(coords.back_button.x, coords.back_button.y);
    await sleep(1000);
    tap(coords.back_button.x, coords.back_button.y);
    await sleep(1000);

    return true;
  } catch (error) {
    console.error(`   ❌ Error in send dm flow: ${error.message}`);
    throw error;
  }
}

// Send Instagram DM for a lead using the "send dm" flow
async function sendDMForLead(lead) {
  const { id, instagram_handle, personalized_message } = lead;
  
  console.log(`\n📱 Processing lead: ${id}`);
  console.log(`   Handle: @${instagram_handle}`);
  console.log(`   Message: ${personalized_message.substring(0, 50)}...`);

  try {
    await sendDM(instagram_handle, personalized_message);
    console.log(`   ✅ Successfully sent DM to @${instagram_handle.replace('@', '')}`);
    return true;
  } catch (error) {
    console.error(`   ❌ Error sending DM: ${error.message}`);
    throw error;
  }
}

// Main bot loop
async function runBot() {
  console.log('🤖 Instagram Outreach Bot Starting...\n');

  // Check ADB connection
  if (!checkAdbConnection()) {
    process.exit(1);
  }

  console.log('✅ ADB connection verified\n');
  console.log('📋 Bot will continuously process pending leads...');
  console.log('   Press Ctrl+C to stop\n');

  let processedCount = 0;
  let errorCount = 0;

  // Main loop
  while (true) {
    try {
      // Get next pending lead
      const lead = await getNextInstagramLead();

      if (!lead) {
        console.log('⏸️  No pending leads found. Waiting 30 seconds...');
        await sleep(30000);
        continue;
      }

      // Send DM
      try {
        await sendDMForLead(lead);
        await markInstagramLeadSent(lead.id, 'sent');
        processedCount++;
        console.log(`\n✅ Lead ${lead.id} marked as sent (Total: ${processedCount} sent, ${errorCount} failed)\n`);
      } catch (error) {
        // Mark as failed
        try {
          await markInstagramLeadSent(lead.id, 'failed');
          errorCount++;
          console.log(`\n❌ Lead ${lead.id} marked as failed (Total: ${processedCount} sent, ${errorCount} failed)\n`);
        } catch (markError) {
          console.error(`❌ Failed to mark lead as failed: ${markError.message}`);
        }
      }

      // Wait before processing next lead (to avoid rate limiting)
      console.log('⏳ Waiting 10 seconds before next lead...\n');
      await sleep(10000);

    } catch (error) {
      console.error('❌ Error in main loop:', error.message);
      console.log('⏳ Waiting 30 seconds before retry...\n');
      await sleep(30000);
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Bot stopped by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Bot stopped');
  process.exit(0);
});

// Start the bot
runBot().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

