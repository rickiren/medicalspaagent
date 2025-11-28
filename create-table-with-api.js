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
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

// SQL statement
const sql = `
CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  config_json JSONB
);
`;

async function createTable() {
  try {
    // Use Supabase Management API
    const projectRef = supabaseUrl.split('//')[1].split('.')[0];
    const managementUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
    
    const response = await fetch(managementUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({ query: sql })
    });

    if (response.ok) {
      console.log('✅ Table created successfully via API!');
    } else {
      const error = await response.text();
      console.log('⚠️  Could not create table via API (this is normal - anon keys cannot execute DDL)');
      console.log('Please use the SQL provided in businesses.sql file');
      console.log('\nError:', error);
    }
  } catch (err) {
    console.log('⚠️  API method not available. Please use the SQL file instead.');
    console.log('Error:', err.message);
  }
}

// For now, just show the SQL since DDL requires service role key or SQL editor
console.log('SQL to create businesses table:');
console.log('='.repeat(60));
console.log(sql);
console.log('='.repeat(60));
console.log('\n📝 This SQL is also saved in businesses.sql');
console.log('\nTo execute:');
console.log('1. Go to Supabase Dashboard → SQL Editor');
console.log('2. Paste and run the SQL above');
console.log('3. Or use: supabase db execute --file businesses.sql');

