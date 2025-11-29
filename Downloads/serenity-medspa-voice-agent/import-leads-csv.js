import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';
// Simple CSV parser (no external dependency needed)
function parseCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  // Parse header
  const headers = parseCSVLine(lines[0]);
  const records = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;
    
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    records.push(record);
  }
  
  return records;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

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

// Extract domain from website URL
function extractDomain(website) {
  if (!website) return null;
  try {
    const url = new URL(website);
    return url.hostname.replace('www.', '');
  } catch (e) {
    return null;
  }
}

// Generate ID from name and domain
function generateId(name, domain) {
  const base = `${name}-${domain || 'no-domain'}`;
  return base
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100); // Limit length
}

// Parse CSV and import leads
async function importLeads(csvPath) {
  try {
    console.log(`Reading CSV file: ${csvPath}`);
    const csvContent = readFileSync(csvPath, 'utf-8');
    
    // Parse CSV
    const records = parseCSV(csvContent);

    console.log(`Found ${records.length} records in CSV`);

    const leads = [];
    const errors = [];

    for (const record of records) {
      try {
        const name = record.title?.trim();
        if (!name) {
          console.warn('Skipping record with no title:', record);
          continue;
        }

        const website = record.website?.trim() || null;
        const domain = website ? extractDomain(website) : null;
        const phone = record.phone?.trim() || null;
        const email = record.email?.trim() || null;
        const instagram = record.instagram?.trim() || null;
        const facebook = record.facebook?.trim() || null;
        const linkedin = record.linkedin?.trim() || null;
        const tiktok = record.tiktok?.trim() || null;

        // Build Google Maps data JSONB
        const googleMapsData = {
          url: record.url || null,
          placeId: record.url ? extractPlaceId(record.url) : null,
          address: {
            street: record.street || null,
            city: record.city || null,
            state: record.state || null,
            countryCode: record.countryCode || null,
            full: buildFullAddress(record),
          },
          rating: record.totalScore ? parseFloat(record.totalScore) : null,
          reviewsCount: record.reviewsCount ? parseInt(record.reviewsCount, 10) : null,
          category: record.categoryName || null,
        };

        // Build scraped data JSONB (for future additional data)
        const scrapedData = {
          source: 'apify-google-places',
          scrapedAt: new Date().toISOString(),
          originalData: {
            title: record.title,
            totalScore: record.totalScore,
            reviewsCount: record.reviewsCount,
            street: record.street,
            city: record.city,
            state: record.state,
            countryCode: record.countryCode,
            website: record.website,
            phone: record.phone,
            categoryName: record.categoryName,
            url: record.url,
          },
        };

        const id = generateId(name, domain);

        leads.push({
          id,
          name,
          website,
          domain,
          phone,
          email,
          instagram,
          facebook,
          linkedin,
          tiktok,
          google_maps_data: googleMapsData,
          scraped_data: scrapedData,
          status: 'new',
          email_status: 'not_sent',
        });
      } catch (err) {
        errors.push({ record, error: err.message });
        console.error(`Error processing record:`, err.message, record);
      }
    }

    console.log(`\nProcessed ${leads.length} leads`);
    if (errors.length > 0) {
      console.warn(`\n${errors.length} errors occurred during processing`);
    }

    // Insert leads in batches
    const batchSize = 50;
    let inserted = 0;
    let updated = 0;
    let failed = 0;

    for (let i = 0; i < leads.length; i += batchSize) {
      const batch = leads.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('leads')
        .upsert(batch, {
          onConflict: 'id',
          ignoreDuplicates: false,
        })
        .select();

      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        failed += batch.length;
      } else {
        // Count new vs updated (rough estimate - upsert doesn't tell us)
        inserted += batch.length;
        console.log(`Batch ${Math.floor(i / batchSize) + 1}: Processed ${batch.length} leads`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('Import Summary:');
    console.log(`Total leads processed: ${leads.length}`);
    console.log(`Inserted/Updated: ${inserted}`);
    console.log(`Failed: ${failed}`);
    if (errors.length > 0) {
      console.log(`Records with errors: ${errors.length}`);
    }
    console.log('='.repeat(60));

  } catch (err) {
    console.error('Error importing leads:', err);
    process.exit(1);
  }
}

// Extract place ID from Google Maps URL
function extractPlaceId(url) {
  if (!url) return null;
  try {
    const match = url.match(/query_place_id=([^&]+)/);
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
}

// Build full address string
function buildFullAddress(record) {
  const parts = [
    record.street,
    record.city,
    record.state,
    record.countryCode,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}

// Main execution
const csvPath = process.argv[2] || '/Users/rickybodner/Downloads/dataset_crawler-google-places_2025-11-29_14-12-38-918.csv';

if (!csvPath || !csvPath.endsWith('.csv')) {
  console.error('Usage: node import-leads-csv.js <path-to-csv-file>');
  console.error('Example: node import-leads-csv.js ../Downloads/dataset_crawler-google-places_2025-11-29_14-12-38-918.csv');
  process.exit(1);
}

importLeads(csvPath)
  .then(() => {
    console.log('\n✅ Import completed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Import failed:', err);
    process.exit(1);
  });

