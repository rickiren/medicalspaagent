import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
try {
  const envContent = readFileSync(join(__dirname, '.env.local'), 'utf-8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  Object.assign(process.env, envVars);
} catch (err) {
  console.error('Error reading .env.local:', err.message);
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

// SQL statement to create the businesses table
const sql = `
CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  config_json JSONB
);
`;

console.log('='.repeat(60));
console.log('SQL Statement to create businesses table:');
console.log('='.repeat(60));
console.log(sql);
console.log('='.repeat(60));
console.log('\n📋 Instructions:');
console.log('1. Copy the SQL above');
console.log('2. Go to your Supabase Dashboard: https://supabase.com/dashboard');
console.log('3. Navigate to SQL Editor');
console.log('4. Paste and run the SQL statement');
console.log('\nAlternatively, if you have Supabase CLI installed:');
console.log('Run: supabase db execute --file businesses.sql');
console.log('\nOr use the Supabase Management API with your service role key.');
