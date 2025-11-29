/**
 * Test script to verify VoiceWidget configuration
 * Run with: node test-voice-widget.js
 */

import dotenv from 'dotenv';
import { readFileSync } from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

console.log('🎤 Testing VoiceWidget Configuration\n');
console.log('='.repeat(60));

// Test 1: Check VITE_GEMINI_API_KEY
console.log('\n1️⃣  Checking VITE_GEMINI_API_KEY (client-side)...');
const viteApiKey = process.env.VITE_GEMINI_API_KEY;
if (viteApiKey) {
  console.log(`   ✅ Found: ${viteApiKey.substring(0, 20)}...`);
  console.log(`   📝 Length: ${viteApiKey.length} characters`);
  if (viteApiKey.startsWith('AIza')) {
    console.log('   ✅ Format looks correct (starts with AIza)');
  } else {
    console.log('   ⚠️  Format might be incorrect (should start with AIza)');
  }
} else {
  console.log('   ❌ Not found - VoiceWidget will not work!');
  console.log('   💡 Add VITE_GEMINI_API_KEY to .env.local');
}

// Test 2: Check GEMINI_API_KEY (server-side)
console.log('\n2️⃣  Checking GEMINI_API_KEY (server-side)...');
const serverApiKey = process.env.GEMINI_API_KEY;
if (serverApiKey) {
  console.log(`   ✅ Found: ${serverApiKey.substring(0, 20)}...`);
} else {
  console.log('   ⚠️  Not found (server-side calls may fail)');
}

// Test 3: Check if keys match
console.log('\n3️⃣  Checking if keys match...');
if (viteApiKey && serverApiKey) {
  if (viteApiKey === serverApiKey) {
    console.log('   ✅ Keys match');
  } else {
    console.log('   ⚠️  Keys are different (this is OK if intentional)');
  }
}

// Test 4: Check .env.local file
console.log('\n4️⃣  Checking .env.local file...');
try {
  const envContent = readFileSync('.env.local', 'utf-8');
  const hasViteKey = envContent.includes('VITE_GEMINI_API_KEY');
  const hasServerKey = envContent.includes('GEMINI_API_KEY=');
  const hasServiceAccount = envContent.includes('GOOGLE_APPLICATION_CREDENTIALS');
  
  if (hasViteKey) {
    console.log('   ✅ VITE_GEMINI_API_KEY found in .env.local');
  } else {
    console.log('   ❌ VITE_GEMINI_API_KEY not in .env.local');
  }
  
  if (hasServerKey) {
    console.log('   ✅ GEMINI_API_KEY found in .env.local');
  }
  
  if (hasServiceAccount) {
    console.log('   ✅ GOOGLE_APPLICATION_CREDENTIALS found in .env.local');
  }
} catch (error) {
  console.log(`   ❌ Error reading .env.local: ${error.message}`);
}

// Test 5: Check VoiceWidget code
console.log('\n5️⃣  Checking VoiceWidget code...');
try {
  const widgetCode = readFileSync('components/VoiceWidget.tsx', 'utf-8');
  const usesViteKey = widgetCode.includes('VITE_GEMINI_API_KEY');
  const usesImportMeta = widgetCode.includes('import.meta.env');
  
  if (usesViteKey) {
    console.log('   ✅ VoiceWidget uses VITE_GEMINI_API_KEY');
  } else {
    console.log('   ⚠️  VoiceWidget does not use VITE_GEMINI_API_KEY');
  }
  
  if (usesImportMeta) {
    console.log('   ✅ VoiceWidget uses import.meta.env (correct for Vite)');
  }
} catch (error) {
  console.log(`   ⚠️  Could not read VoiceWidget.tsx: ${error.message}`);
}

// Test 6: Check vite.config.ts
console.log('\n6️⃣  Checking vite.config.ts...');
try {
  const viteConfig = readFileSync('vite.config.ts', 'utf-8');
  const loadsEnv = viteConfig.includes('loadEnv') || viteConfig.includes('dotenv');
  
  if (loadsEnv) {
    console.log('   ✅ Vite config loads environment variables');
  } else {
    console.log('   ⚠️  Vite config might not load environment variables');
  }
} catch (error) {
  console.log(`   ⚠️  Could not read vite.config.ts: ${error.message}`);
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📋 Summary:');
if (viteApiKey) {
  console.log('   ✅ VITE_GEMINI_API_KEY: Configured');
  console.log('   💡 VoiceWidget should work if dev server is running');
  console.log('   💡 Restart dev server after adding VITE_ variables');
} else {
  console.log('   ❌ VITE_GEMINI_API_KEY: Missing');
  console.log('   💡 Add VITE_GEMINI_API_KEY=your_key to .env.local');
  console.log('   💡 Restart dev server after adding');
}

if (serverApiKey) {
  console.log('   ✅ GEMINI_API_KEY: Configured (server-side)');
} else {
  console.log('   ⚠️  GEMINI_API_KEY: Missing (server-side)');
}

console.log('\n🔧 Next Steps:');
console.log('   1. Ensure VITE_GEMINI_API_KEY is in .env.local');
console.log('   2. Restart your dev server: npm run dev');
console.log('   3. Open browser console and check for errors');
console.log('   4. Look for [VOICE-WIDGET] log messages');
console.log('\n');

