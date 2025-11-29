import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

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
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  console.error('Need: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read SQL file
const sqlPath = join(__dirname, 'create-leads-table.sql');
const sql = readFileSync(sqlPath, 'utf-8');

async function createTable() {
  try {
    console.log('Creating leads table...');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    // Execute each statement using RPC or direct SQL
    // Note: Supabase JS client doesn't support raw SQL execution directly
    // We'll need to use the REST API or execute via Supabase dashboard
    
    console.log('\n⚠️  Supabase JS client cannot execute raw SQL directly.');
    console.log('\nPlease run the SQL file in one of these ways:');
    console.log('\n1. Via Supabase Dashboard:');
    console.log('   - Go to your Supabase project');
    console.log('   - Navigate to SQL Editor');
    console.log('   - Copy and paste the contents of create-leads-table.sql');
    console.log('   - Click "Run"');
    console.log('\n2. Via Supabase CLI (if installed):');
    console.log('   supabase db execute --file create-leads-table.sql');
    console.log('\n3. The SQL file is located at:');
    console.log(`   ${sqlPath}`);
    console.log('\nAfter creating the table, run: node import-leads-csv.js');
    
    // Try to check if table exists
    const { data, error } = await supabase
      .from('leads')
      .select('id')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('\n❌ Table does not exist. Please create it using one of the methods above.');
    } else if (error) {
      console.log('\n❌ Error checking table:', error.message);
    } else {
      console.log('\n✅ Table already exists! You can proceed with importing.');
    }
    
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

createTable();

