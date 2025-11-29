#!/usr/bin/env node

/**
 * Diagnostic script to check .env.local file for formatting issues
 * Run: node check-env.js
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const envLocalPath = resolve(process.cwd(), '.env.local');

console.log('🔍 Checking .env.local file for issues...\n');

if (!existsSync(envLocalPath)) {
  console.error('❌ .env.local file not found at:', envLocalPath);
  process.exit(1);
}

const content = readFileSync(envLocalPath, 'utf-8');
const lines = content.split('\n');

console.log(`📄 File found: ${envLocalPath}`);
console.log(`📊 Total lines: ${lines.length}\n`);

let foundOpenAIKey = false;
let openAILineNumber = -1;
let issues = [];

lines.forEach((line, index) => {
  const lineNum = index + 1;
  const trimmed = line.trim();
  
  // Skip empty lines and comments
  if (!trimmed || trimmed.startsWith('#')) {
    return;
  }
  
  // Check for VITE_OPENAI_API_KEY
  if (trimmed.includes('VITE_OPENAI_API_KEY') || trimmed.includes('OPENAI_API_KEY')) {
    foundOpenAIKey = true;
    openAILineNumber = lineNum;
    
    console.log(`✅ Found OpenAI key on line ${lineNum}:`);
    console.log(`   Raw line: ${JSON.stringify(line)}`);
    console.log(`   Trimmed: ${JSON.stringify(trimmed)}`);
    
    // Check for common issues
    if (line !== trimmed) {
      issues.push(`Line ${lineNum}: Has leading/trailing whitespace`);
    }
    
    if (line.includes('  ')) {
      issues.push(`Line ${lineNum}: Has multiple spaces (might be tab/space mix)`);
    }
    
    // Check for invisible characters
    const hasInvisible = /[\u200B-\u200D\uFEFF\u00A0]/.test(line);
    if (hasInvisible) {
      issues.push(`Line ${lineNum}: Contains invisible Unicode characters`);
    }
    
    // Check format
    if (!trimmed.startsWith('VITE_OPENAI_API_KEY=')) {
      issues.push(`Line ${lineNum}: Doesn't start with "VITE_OPENAI_API_KEY="`);
    }
    
    // Check for comments on same line
    if (trimmed.includes('#') && trimmed.indexOf('#') < trimmed.indexOf('=')) {
      // Comment before = is fine
    } else if (trimmed.includes('#') && trimmed.split('=')[1]?.includes('#')) {
      issues.push(`Line ${lineNum}: Has comment after value (might break parsing)`);
    }
    
    // Check for spaces around =
    const parts = trimmed.split('=');
    if (parts.length === 2) {
      if (parts[0].endsWith(' ') || parts[0].endsWith('\t')) {
        issues.push(`Line ${lineNum}: Has space before =`);
      }
      if (parts[1].startsWith(' ') || parts[1].startsWith('\t')) {
        issues.push(`Line ${lineNum}: Has space after =`);
      }
    }
    
    // Check value
    const match = trimmed.match(/VITE_OPENAI_API_KEY=(.+)/);
    if (match) {
      const value = match[1].split('#')[0].trim(); // Remove inline comments
      if (!value) {
        issues.push(`Line ${lineNum}: Has no value after =`);
      } else if (!value.startsWith('sk-')) {
        issues.push(`Line ${lineNum}: Value doesn't start with "sk-" (might be wrong key)`);
      }
    }
  }
});

console.log('\n📋 All VITE_ prefixed variables found:');
lines.forEach((line, index) => {
  const trimmed = line.trim();
  if (trimmed.startsWith('VITE_') && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const [key] = trimmed.split('=');
    console.log(`   Line ${index + 1}: ${key}`);
  }
});

if (!foundOpenAIKey) {
  console.log('\n❌ VITE_OPENAI_API_KEY not found in file!');
  console.log('   Please add: VITE_OPENAI_API_KEY=sk-your-key-here');
} else {
  console.log(`\n✅ VITE_OPENAI_API_KEY found on line ${openAILineNumber}`);
}

if (issues.length > 0) {
  console.log('\n⚠️  Issues detected:');
  issues.forEach(issue => console.log(`   - ${issue}`));
  console.log('\n🔧 Fix: Delete the line and re-type it manually (no copy/paste)');
  console.log('   VITE_OPENAI_API_KEY=sk-your-key-here');
} else if (foundOpenAIKey) {
  console.log('\n✅ No formatting issues detected!');
  console.log('   If Vite still doesn\'t load it, try:');
  console.log('   1. Restart dev server');
  console.log('   2. Clear cache: rm -rf node_modules/.vite');
  console.log('   3. Run: npm run dev -- --debug');
}

console.log('\n');

