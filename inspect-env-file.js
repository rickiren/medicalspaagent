#!/usr/bin/env node

/**
 * Inspect .env.local file to find formatting issues
 * Run: node inspect-env-file.js
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const envLocalPath = resolve(process.cwd(), '.env.local');

console.log('🔍 Inspecting .env.local file...\n');

if (!existsSync(envLocalPath)) {
  console.error('❌ .env.local file not found at:', envLocalPath);
  process.exit(1);
}

const content = readFileSync(envLocalPath, 'utf-8');
const lines = content.split('\n');

console.log(`📄 File: ${envLocalPath}`);
console.log(`📊 Total lines: ${lines.length}\n`);

// Find the OpenAI key line
let openAILine = null;
let openAILineNum = -1;

lines.forEach((line, index) => {
  const lineNum = index + 1;
  const trimmed = line.trim();
  
  // Check if this line mentions OpenAI
  if (trimmed.includes('OPENAI') && !trimmed.startsWith('#')) {
    openAILine = line;
    openAILineNum = lineNum;
    
    console.log(`📍 Found OpenAI-related line ${lineNum}:`);
    console.log(`   Raw bytes: ${JSON.stringify(line)}`);
    console.log(`   Length: ${line.length} characters`);
    console.log(`   Trimmed: ${JSON.stringify(trimmed)}`);
    console.log(`   Trimmed length: ${trimmed.length} characters`);
    
    // Check for invisible characters
    const invisibleChars = [];
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const code = char.charCodeAt(0);
      // Check for common invisible characters
      if (
        (code >= 0x200B && code <= 0x200D) || // Zero-width space, etc
        code === 0xFEFF || // BOM
        code === 0x00A0 || // Non-breaking space
        code === 0x2000 || // En quad
        code === 0x2001 || // Em quad
        (code >= 0x2002 && code <= 0x200A) // Various spaces
      ) {
        invisibleChars.push({ pos: i, char, code: `0x${code.toString(16)}` });
      }
    }
    
    if (invisibleChars.length > 0) {
      console.log(`   ⚠️  INVISIBLE CHARACTERS FOUND at positions:`, invisibleChars);
    }
    
    // Check format
    if (trimmed.startsWith('VITE_OPENAI_API_KEY=')) {
      const value = trimmed.split('=')[1];
      console.log(`   ✅ Format looks correct`);
      console.log(`   Value length: ${value?.length || 0}`);
      if (value && value.startsWith('sk-')) {
        console.log(`   ✅ Value starts with 'sk-'`);
      } else {
        console.log(`   ⚠️  Value doesn't start with 'sk-'`);
      }
    } else if (trimmed.startsWith('OPENAI_API_KEY=')) {
      console.log(`   ❌ Missing VITE_ prefix!`);
      console.log(`   Should be: VITE_OPENAI_API_KEY=...`);
    } else {
      console.log(`   ❌ Doesn't match expected format`);
      console.log(`   Expected: VITE_OPENAI_API_KEY=sk-...`);
    }
    
    // Check for spaces
    if (line.includes('  ')) {
      console.log(`   ⚠️  Contains multiple spaces`);
    }
    
    // Check for tabs
    if (line.includes('\t')) {
      console.log(`   ⚠️  Contains tabs`);
    }
    
    // Hex dump of the line
    console.log(`   Hex dump: ${Array.from(line).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ')}`);
  }
});

if (!openAILine) {
  console.log('\n❌ No OpenAI-related line found in .env.local!');
  console.log('   Please add: VITE_OPENAI_API_KEY=sk-your-key-here');
} else {
  console.log('\n📋 All variables found in file:');
  let varCount = 0;
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      if (trimmed.includes('=')) {
        const [key] = trimmed.split('=');
        varCount++;
        const isVite = key.startsWith('VITE_');
        console.log(`   Line ${index + 1}: ${key} ${isVite ? '(VITE_)' : ''}`);
      }
    }
  });
  console.log(`\n   Total variables: ${varCount}`);
}

console.log('\n');

