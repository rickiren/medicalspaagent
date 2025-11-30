#!/usr/bin/env node

/**
 * Instagram Follow Bot
 * 
 * This script runs locally on your Mac and uses ADB to control an Android emulator
 * to automatically follow Instagram accounts based on data from Supabase.
 * 
 * Prerequisites:
 * 1. Install ADB: brew install android-platform-tools
 * 2. Start Android emulator
 * 3. Verify connection: adb devices
 * 4. Make sure Instagram is installed and logged in on the emulator
 * 5. Configure screen coordinates in the coords object below
 * 
 * Run: node scripts/instagramFollowBot.js
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
  follow_button: { x: 290, y: 770 },      // "Follow" button on profile
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
    const lines = output.trim().split('\n').slice(1);
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

// Get next pending lead from Supabase (for follow bot, we'll use a different status field)
// For now, we'll use the same leads table but with a follow_status column
// You may want to add: follow_status column to leads table
async function getNextInstagramFollowLead() {
  try {
    // Get leads where follow_status is 'pending' OR null (null means not processed yet)
    const { data, error } = await supabase
      .from('leads')
      .select('id, instagram_handle, follow_status')
      .or('follow_status.eq.pending,follow_status.is.null')
      .not('instagram_handle', 'is', null)
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
    console.error('❌ Error fetching next follow lead:', error.message);
    throw error;
  }
}

// Mark lead as followed or failed
async function markInstagramLeadFollowed(id, status = 'followed') {
  try {
    // Ensure status is valid (map 'sent' to 'followed' for consistency)
    const finalStatus = status === 'sent' ? 'followed' : status;
    
    const { error } = await supabase
      .from('leads')
      .update({ follow_status: finalStatus })
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

// "follow" flow - reusable function for following Instagram accounts
// This flow can be used in other scripts
async function followAccount(handle) {
  try {
    // Step 1: Open Instagram search
    console.log('   [Step 1/7] Opening search (tap search button)...');
    tap(coords.search_button.x, coords.search_button.y);
    await sleep(2000);

    // Step 2: Tap search input
    console.log('   [Step 2/7] Tapping search input field...');
    tap(coords.search_input.x, coords.search_input.y);
    await sleep(1000);

    // Step 3: Type Instagram handle (remove @ if present)
    const cleanHandle = handle.replace('@', '').trim();
    console.log(`   [Step 3/6] Typing Instagram handle: @${cleanHandle}`);
    typeText(cleanHandle);
    await sleep(2000);

    // Step 4: Tap first result
    console.log(`   [Step 4/6] Tapping first search result at (${coords.first_result.x}, ${coords.first_result.y})...`);
    tap(coords.first_result.x, coords.first_result.y);
    await sleep(3000);

    // Step 5: Tap Follow button (instead of Message)
    console.log(`   [Step 5/6] Tapping Follow button at (${coords.follow_button.x}, ${coords.follow_button.y})...`);
    tap(coords.follow_button.x, coords.follow_button.y);
    await sleep(2000);

    // Step 6: Navigate back (tap back button twice to return to home)
    console.log('   [Step 6/6] Navigating back (tapping back button twice)...');
    tap(coords.back_button.x, coords.back_button.y);
    await sleep(1000);
    tap(coords.back_button.x, coords.back_button.y);
    await sleep(1000);

    return true;
  } catch (error) {
    console.error(`   ❌ Error in follow flow: ${error.message}`);
    throw error;
  }
}

// Follow Instagram account for a lead using the "follow" flow
async function followAccountForLead(lead) {
  const { id, instagram_handle } = lead;
  
  console.log(`\n📱 Processing follow for lead: ${id}`);
  console.log(`   Instagram handle: @${instagram_handle}`);
  console.log(`   Starting "follow" flow...\n`);

  try {
    await followAccount(instagram_handle);
    console.log(`\n   ✅ Successfully completed follow flow for @${instagram_handle.replace('@', '')}`);
    return true;
  } catch (error) {
    console.error(`\n   ❌ Error in follow flow: ${error.message}`);
    throw error;
  }
}

// Main bot loop
async function runBot() {
  console.log('🤖 Instagram Follow Bot Starting...\n');

  // Check ADB connection
  if (!checkAdbConnection()) {
    process.exit(1);
  }

  console.log('✅ ADB connection verified\n');
  console.log('📋 Bot will continuously process pending follow leads...');
  console.log('   Press Ctrl+C to stop\n');

  let processedCount = 0;
  let errorCount = 0;

  // Main loop
  while (true) {
    try {
      // Get next pending lead
      const lead = await getNextInstagramFollowLead();

      if (!lead) {
        console.log('⏸️  No pending follow leads found. Waiting 30 seconds...');
        await sleep(30000);
        continue;
      }

      // Follow account
      try {
        await followAccountForLead(lead);
        await markInstagramLeadFollowed(lead.id, 'followed');
        processedCount++;
        console.log(`\n✅ Lead ${lead.id} marked as followed (Total: ${processedCount} followed, ${errorCount} failed)\n`);
      } catch (error) {
        // Mark as failed
        try {
          await markInstagramLeadFollowed(lead.id, 'failed');
          errorCount++;
          console.log(`\n❌ Lead ${lead.id} marked as failed (Total: ${processedCount} followed, ${errorCount} failed)\n`);
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

