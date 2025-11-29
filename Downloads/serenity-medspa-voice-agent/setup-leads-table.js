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
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials in .env.local');
  console.error('Need: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupLeadsTable() {
  try {
    console.log('Setting up leads table...\n');

    // Read the SQL file
    const sqlPath = join(__dirname, 'add-leads-columns.sql');
    const sql = readFileSync(sqlPath, 'utf-8');

    // Try to execute SQL using Supabase REST API
    // Extract project ref from URL
    const projectRef = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1];
    
    if (!projectRef) {
      console.error('Could not extract project reference from Supabase URL');
      console.log('\nPlease run the SQL manually:');
      console.log('1. Go to Supabase Dashboard → SQL Editor');
      console.log('2. Copy contents of: add-leads-columns.sql');
      console.log('3. Paste and run');
      process.exit(1);
    }

    // Use Supabase Management API (requires service role key)
    const managementUrl = `https://${projectRef}.supabase.co/rest/v1/rpc/exec_sql`;
    
    // Split SQL into individual statements and execute them
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Executing ${statements.length} SQL statements...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      try {
        // Try using PostgREST RPC (if exec_sql function exists)
        // Otherwise, we'll need to use a different approach
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: statement 
        });

        if (error) {
          // RPC might not exist, try direct REST API call
          const response = await fetch(`https://${projectRef}.supabase.co/rest/v1/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ query: statement })
          });

          if (!response.ok) {
            // This approach likely won't work either
            throw new Error(`HTTP ${response.status}`);
          }
        }

        successCount++;
        if (i % 5 === 0) {
          process.stdout.write('.');
        }
      } catch (err) {
        errorCount++;
        // Silently continue - some statements might fail if columns already exist
      }
    }

    console.log('\n\n⚠️  Direct SQL execution via API is not supported by Supabase JS client.');
    console.log('\n📋 Please run the SQL manually:');
    console.log('\n1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of: add-leads-columns.sql');
    console.log('4. Click "Run"');
    console.log('\nAlternatively, if the table already has basic structure,');
    console.log('you can try running the import script - it will handle missing columns gracefully.\n');

    // Test if table has required columns by trying a simple query
    console.log('Testing table structure...');
    const { data, error } = await supabase
      .from('leads')
      .select('id, name, phone, website, domain')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ Table does not exist. Please run create-leads-table.sql first.');
      } else if (error.message.includes('column')) {
        console.log('⚠️  Some columns are missing. Please run add-leads-columns.sql');
        console.log(`Error: ${error.message}`);
      } else {
        console.log(`⚠️  Error: ${error.message}`);
      }
    } else {
      console.log('✅ Table structure looks good! You can proceed with importing.');
    }

  } catch (err) {
    console.error('Error:', err.message);
    console.log('\nPlease run the SQL files manually in Supabase Dashboard → SQL Editor');
  }
}

setupLeadsTable();

