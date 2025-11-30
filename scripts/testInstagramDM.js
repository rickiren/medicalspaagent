#!/usr/bin/env node

/**
 * Instagram DM Test Script
 * 
 * Tests sending a single Instagram DM to verify coordinates and workflow.
 * 
 * Usage: node scripts/testInstagramDM.js
 */

import { execSync } from 'child_process';

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

// Test data
const testHandle = 'rickibodner';
const testMessage = 'hey';

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

// "send dm" flow - reusable function for sending Instagram DMs
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

// Test function using the "send dm" flow
async function sendTestDM() {
  console.log(`\n📱 Testing Instagram DM`);
  console.log(`   Handle: @${testHandle}`);
  console.log(`   Message: "${testMessage}"`);
  console.log(`\n⚠️  Make sure Instagram is open and ready!\n`);
  
  // Wait 3 seconds for user to prepare
  console.log('Starting in 3 seconds...');
  await sleep(3000);

  try {
    await sendDM(testHandle, testMessage);
    console.log(`\n✅ Test completed! Check Instagram to verify the DM was sent.`);
    console.log(`   Sent to: @${testHandle}`);
    console.log(`   Message: "${testMessage}"`);
  } catch (error) {
    console.error(`\n❌ Error during test: ${error.message}`);
    throw error;
  }
}

// Main function
async function runTest() {
  console.log('🧪 Instagram DM Test Script\n');
  console.log('This will send a test DM to @rickibodner with message "hey"');
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
    await sendTestDM();
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

