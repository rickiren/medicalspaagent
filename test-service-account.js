/**
 * Test script to verify Google Service Account authentication
 * Run with: node test-service-account.js
 */

import { getGeminiAccessToken, isServiceAccountConfigured, initializeGeminiAuth } from './utils/geminiAuth.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

console.log('🧪 Testing Google Service Account Authentication\n');
console.log('='.repeat(60));

// Test 1: Check environment variable
console.log('\n1️⃣  Checking GOOGLE_APPLICATION_CREDENTIALS...');
const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (credsPath) {
  console.log(`   ✅ Found: ${credsPath}`);
} else {
  console.log('   ❌ Not set in environment');
  process.exit(1);
}

// Test 2: Check if file exists
console.log('\n2️⃣  Checking service account file exists...');
const resolvedPath = credsPath.startsWith('/') 
  ? credsPath 
  : resolve(process.cwd(), credsPath);

try {
  const stats = readFileSync(resolvedPath, 'utf-8');
  const creds = JSON.parse(stats);
  console.log(`   ✅ File exists and is valid JSON`);
  console.log(`   📧 Service Account Email: ${creds.client_email}`);
  console.log(`   🆔 Project ID: ${creds.project_id}`);
} catch (error) {
  console.log(`   ❌ Error reading file: ${error.message}`);
  process.exit(1);
}

// Test 3: Check if service account is configured
console.log('\n3️⃣  Checking service account configuration...');
if (isServiceAccountConfigured()) {
  console.log('   ✅ Service account is configured');
} else {
  console.log('   ❌ Service account not configured');
  process.exit(1);
}

// Test 4: Initialize auth client
console.log('\n4️⃣  Initializing Google Auth client...');
try {
  const auth = initializeGeminiAuth();
  console.log('   ✅ Auth client initialized');
} catch (error) {
  console.log(`   ❌ Failed to initialize: ${error.message}`);
  process.exit(1);
}

// Test 5: Get access token
console.log('\n5️⃣  Getting access token...');
try {
  const token = await getGeminiAccessToken();
  if (token && token.length > 0) {
    console.log(`   ✅ Access token obtained (${token.substring(0, 20)}...)`);
  } else {
    console.log('   ❌ Token is empty');
    process.exit(1);
  }
} catch (error) {
  console.log(`   ❌ Failed to get token: ${error.message}`);
  console.log(`   Stack: ${error.stack}`);
  process.exit(1);
}

// Test 6: Test API call with service account
console.log('\n6️⃣  Testing Gemini API call with service account...');
try {
  const token = await getGeminiAccessToken();
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Say "Hello, service account is working!" in one sentence.' }]
        }]
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.log(`   ❌ API call failed: ${response.status} ${response.statusText}`);
    console.log(`   Error: ${errorText}`);
    process.exit(1);
  }

  const data = await response.json();
  if (data.candidates && data.candidates[0] && data.candidates[0].content) {
    const text = data.candidates[0].content.parts[0].text;
    console.log(`   ✅ API call successful!`);
    console.log(`   📝 Response: ${text}`);
  } else {
    console.log('   ❌ Invalid response format');
    console.log('   Response:', JSON.stringify(data, null, 2));
    process.exit(1);
  }
} catch (error) {
  console.log(`   ❌ API call error: ${error.message}`);
  console.log(`   Stack: ${error.stack}`);
  process.exit(1);
}

// Test 7: Check API key for VoiceWidget
console.log('\n7️⃣  Checking API key for VoiceWidget (Live API)...');
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
if (apiKey) {
  console.log(`   ✅ API key found (${apiKey.substring(0, 20)}...)`);
  console.log('   ℹ️  Note: Gemini Live API requires API key, not service account token');
} else {
  console.log('   ⚠️  No API key found - VoiceWidget will not work');
  console.log('   💡 Set GEMINI_API_KEY or VITE_GEMINI_API_KEY in .env.local');
}

// Test 8: Test token endpoint
console.log('\n8️⃣  Testing /api/gemini-token endpoint...');
try {
  // Note: This would need the dev server running
  // For now, we'll just check if the endpoint file exists
  const { existsSync } = await import('fs');
  if (existsSync('./api/gemini-token.js')) {
    console.log('   ✅ Token endpoint file exists');
    console.log('   ℹ️  Start dev server and test: curl http://localhost:3000/api/gemini-token');
  } else {
    console.log('   ❌ Token endpoint file not found');
  }
} catch (error) {
  console.log(`   ⚠️  Could not check endpoint: ${error.message}`);
}

console.log('\n' + '='.repeat(60));
console.log('\n✅ All service account tests passed!');
console.log('\n📋 Summary:');
console.log('   • Service account file: ✅');
console.log('   • Environment variable: ✅');
console.log('   • Auth client: ✅');
console.log('   • Access token: ✅');
console.log('   • API call: ✅');
if (apiKey) {
  console.log('   • API key for Live API: ✅');
} else {
  console.log('   • API key for Live API: ⚠️  (VoiceWidget may not work)');
}
console.log('\n');

