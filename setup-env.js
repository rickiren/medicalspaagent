import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envLocalPath = join(__dirname, '.env.local');
const envExamplePath = join(__dirname, '.env.example');

// Check if .env.local exists
const envExists = existsSync(envLocalPath);

// Environment variables template
const envTemplate = `# Gemini API Key (Required for Voice Widget)
# Get your key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=

# Supabase Configuration (Required for Database)
# Get these from your Supabase project settings: https://supabase.com/dashboard
SUPABASE_URL=
SUPABASE_ANON_KEY=

# Firecrawl API Key (Required for Website Scraping)
# Get your key from: https://firecrawl.dev
FIRECRAWL_API_KEY=

# Optional: OpenAI API Key (if needed for other features)
# OPENAI_API_KEY=
# VITE_OPENAI_API_KEY=
`;

// Function to check API keys
async function checkApiKeys() {
  let envVars = {};
  
  if (envExists) {
    try {
      const envContent = readFileSync(envLocalPath, 'utf-8');
      envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            envVars[key.trim()] = valueParts.join('=').trim();
          }
        }
      });
    } catch (err) {
      console.error('Error reading .env.local:', err.message);
    }
  }

  const checks = {
    hasKey: false,
    keyLength: 0,
    keyPrefix: '',
    hasOPENAI_API_KEY: !!envVars.OPENAI_API_KEY,
    hasVITE_OPENAI_API_KEY: !!envVars.VITE_OPENAI_API_KEY,
    hasGEMINI_API_KEY: !!envVars.GEMINI_API_KEY,
    hasSUPABASE_URL: !!envVars.SUPABASE_URL,
    hasSUPABASE_ANON_KEY: !!envVars.SUPABASE_ANON_KEY,
    hasFIRECRAWL_API_KEY: !!envVars.FIRECRAWL_API_KEY,
    allOpenAIKeys: [],
    missingKeys: []
  };

  // Check for OpenAI keys
  if (envVars.OPENAI_API_KEY) {
    checks.allOpenAIKeys.push('OPENAI_API_KEY');
    checks.hasKey = true;
    checks.keyLength = envVars.OPENAI_API_KEY.length;
    checks.keyPrefix = envVars.OPENAI_API_KEY.substring(0, 10) + '...';
  }
  if (envVars.VITE_OPENAI_API_KEY) {
    checks.allOpenAIKeys.push('VITE_OPENAI_API_KEY');
    if (!checks.hasKey) {
      checks.hasKey = true;
      checks.keyLength = envVars.VITE_OPENAI_API_KEY.length;
      checks.keyPrefix = envVars.VITE_OPENAI_API_KEY.substring(0, 10) + '...';
    }
  }

  // Check for required keys
  if (!checks.hasGEMINI_API_KEY) checks.missingKeys.push('GEMINI_API_KEY');
  if (!checks.hasSUPABASE_URL) checks.missingKeys.push('SUPABASE_URL');
  if (!checks.hasSUPABASE_ANON_KEY) checks.missingKeys.push('SUPABASE_ANON_KEY');
  if (!checks.hasFIRECRAWL_API_KEY) checks.missingKeys.push('FIRECRAWL_API_KEY');

  return checks;
}

// Function to test Gemini API key
async function testGeminiApiKey(apiKey) {
  if (!apiKey) {
    return { success: false, error: 'No API key provided' };
  }

  try {
    // Test the API key by making a simple request
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey);
    
    if (!response.ok) {
      const errorText = await response.text();
      return { 
        success: false, 
        error: `API test failed: ${response.status} ${response.statusText}`,
        details: errorText.substring(0, 200)
      };
    }

    const data = await response.json();
    return { success: true, models: data.models?.length || 0 };
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Unknown error',
      details: error.toString()
    };
  }
}

// Main setup function
async function setup() {
  console.log('🔧 Setting up environment configuration...\n');

  // Create .env.example if it doesn't exist
  if (!existsSync(envExamplePath)) {
    writeFileSync(envExamplePath, envTemplate);
    console.log('✅ Created .env.example file');
  }

  // Create .env.local if it doesn't exist
  if (!envExists) {
    writeFileSync(envLocalPath, envTemplate);
    console.log('✅ Created .env.local file');
    console.log('⚠️  Please fill in your API keys in .env.local\n');
  } else {
    console.log('✅ .env.local file exists\n');
  }

  // Check API keys
  console.log('📋 Checking API key configuration...\n');
  const checks = await checkApiKeys();
  
  console.log('Current configuration:');
  console.log('  hasKey:', checks.hasKey);
  if (checks.hasKey) {
    console.log('  keyLength:', checks.keyLength);
    console.log('  keyPrefix:', checks.keyPrefix);
  }
  console.log('  hasOPENAI_API_KEY:', checks.hasOPENAI_API_KEY);
  console.log('  hasVITE_OPENAI_API_KEY:', checks.hasVITE_OPENAI_API_KEY);
  console.log('  hasGEMINI_API_KEY:', checks.hasGEMINI_API_KEY);
  console.log('  hasSUPABASE_URL:', checks.hasSUPABASE_URL);
  console.log('  hasSUPABASE_ANON_KEY:', checks.hasSUPABASE_ANON_KEY);
  console.log('  hasFIRECRAWL_API_KEY:', checks.hasFIRECRAWL_API_KEY);
  console.log('  allOpenAIKeys:', checks.allOpenAIKeys);
  console.log('');

  // Test Gemini API key if available
  if (checks.hasGEMINI_API_KEY) {
    const envContent = readFileSync(envLocalPath, 'utf-8');
    const geminiKey = envContent.split('\n').find(line => line.startsWith('GEMINI_API_KEY='))?.split('=')[1]?.trim();
    
    if (geminiKey && geminiKey !== 'your-gemini-api-key-here' && geminiKey !== '') {
      console.log('🧪 Testing Gemini API key...');
      const testResult = await testGeminiApiKey(geminiKey);
      if (testResult.success) {
        console.log('✅ Gemini API key is valid!');
        console.log(`   Available models: ${testResult.models}`);
      } else {
        console.log('❌ Gemini API key test failed:', testResult.error);
        if (testResult.details) {
          console.log('   Details:', testResult.details);
        }
      }
      console.log('');
    }
  }

  // Show missing keys
  if (checks.missingKeys.length > 0) {
    console.log('⚠️  Missing required environment variables:');
    checks.missingKeys.forEach(key => {
      console.log(`   - ${key}`);
    });
    console.log('\n📝 Please add these to your .env.local file\n');
  } else {
    console.log('✅ All required environment variables are configured!\n');
  }

  console.log('📚 Next steps:');
  console.log('1. Make sure all API keys are set in .env.local');
  console.log('2. Run: npm run dev');
  console.log('3. Visit: http://localhost:3000\n');
}

// Run setup
setup().catch(console.error);

