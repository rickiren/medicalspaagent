#!/usr/bin/env node

/**
 * Instagram Follow Test Script
 * 
 * Tests following a single Instagram account to verify coordinates and workflow.
 * 
 * Usage: node scripts/testInstagramFollow.js
 */

import { execSync } from 'child_process';

// Screen coordinates - Configured for your Android emulator
const coords = {
  search_button: { x: 758, y: 2276 },     // bottom nav search icon
  search_input: { x: 397, y: 125 },       // search bar
  first_result: { x: 498, y: 437 },       // username in search results
  follow_button: { x: 290, y: 770 },      // "Follow" button on profile
  back_button: { x: 73, y: 134 }          // top-left back arrow
};

// Test data
const testHandle = 'crewcut.ai';

// ADB abstraction functions
function tap(x, y) {
  try {
    console.log(`   → Tapping (${x}, ${y})`);
    execSync(`adb shell input tap ${x} ${y}`, { stdio: 'inherit' });
  } catch (error) {
    throw new Error(`Failed to tap at (${x}, ${y}): ${error.message}`);
  }
}

function typeText(text) {
  try {
    // Escape special characters and replace spaces with %s
    const safe = text.replace(/ /g, '%s').replace(/[&$`"\\]/g, '\\$&');
    console.log(`   → Typing: "${text}"`);
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

// "follow" flow - reusable function for following Instagram accounts
async function followAccount(handle) {
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

    // Step 4: Tap first result
    console.log('   → Tapping first search result...');
    tap(coords.first_result.x, coords.first_result.y);
    await sleep(3000);

    // Step 5: Tap Follow button (instead of Message)
    console.log('   → Tapping Follow button...');
    tap(coords.follow_button.x, coords.follow_button.y);
    await sleep(2000);

    // Step 6: Navigate back (tap back button twice to return to home)
    console.log('   → Navigating back...');
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

// Test function using the "follow" flow
async function sendTestFollow() {
  console.log(`\n📱 Testing Instagram Follow`);
  console.log(`   Handle: @${testHandle}`);
  console.log(`\n⚠️  Make sure Instagram is open and ready!\n`);
  
  // Wait 3 seconds for user to prepare
  console.log('Starting in 3 seconds...');
  await sleep(3000);

  try {
    await followAccount(testHandle);
    console.log(`\n✅ Test completed! Check Instagram to verify you followed @${testHandle}`);
  } catch (error) {
    console.error(`\n❌ Error during test: ${error.message}`);
    throw error;
  }
}

// Main function
async function runTest() {
  console.log('🧪 Instagram Follow Test Script\n');
  console.log('This will follow @crewcut.ai on Instagram');
  console.log('Make sure:');
  console.log('  1. Android emulator is running');
  console.log('  2. Instagram is installed and logged in');
  console.log('  3. Instagram app is open (or will be opened)\n');

  // Check ADB connection
  if (!checkAdbConnection()) {
    process.exit(1);
  }

  console.log('\n✅ ADB connection verified\n');

  // Run the test
  try {
    await sendTestFollow();
    console.log('\n✨ Test script completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Test stopped by user');
  process.exit(0);
});

// Start the test
runTest().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

