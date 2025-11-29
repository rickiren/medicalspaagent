import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local file explicitly (Vite uses .env.local by default)
dotenv.config({ path: path.resolve(__dirname, '.env.local') });
// Also try .env as fallback
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig(({ mode }) => {
    // Vite's loadEnv automatically loads .env.local, but we'll also check process.env
    const env = loadEnv(mode, process.cwd(), '');
    
    // Initialize Supabase client
    // Try loadEnv first, then fall back to process.env (which dotenv populates)
    // Also check for VITE_ prefixed versions (for client-side variables)
    const supabaseUrl = env.SUPABASE_URL || process.env.SUPABASE_URL || env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️  Supabase credentials not found in environment variables.');
      console.warn('   Make sure you have SUPABASE_URL and SUPABASE_ANON_KEY set in your .env file');
      console.warn('   Current values:', {
        url: supabaseUrl ? 'SET' : 'MISSING',
        key: supabaseKey ? 'SET' : 'MISSING'
      });
    } else {
      console.log('✅ Supabase credentials loaded successfully');
    }
    
    const supabase = supabaseUrl && supabaseKey 
      ? createClient(supabaseUrl, supabaseKey)
      : null;
    
    return {
      base: '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
        middlewareMode: false,
      },
      build: {
        outDir: 'dist',
        emptyOutDir: true,
      },
      plugins: [
        react(),
        {
          name: 'business-config-api',
          configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
              if (!supabase) {
                if (req.url?.startsWith('/api/')) {
                  console.error('Supabase not configured. Missing SUPABASE_URL or SUPABASE_ANON_KEY');
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ 
                    error: 'Supabase not configured',
                    message: 'Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables'
                  }));
                  return;
                }
                next();
                return;
              }

              const url = req.url || '';
              const method = req.method || 'GET';

              // Handle GET /api/business/:id/config (widget endpoint)
              if (method === 'GET' && url.startsWith('/api/business/') && url.endsWith('/config')) {
                const urlParts = url.split('/');
                const businessId = urlParts[3];
                
                if (!businessId) {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Business ID is required' }));
                  return;
                }

                try {
                  const { data, error } = await supabase
                    .from('businesses')
                    .select('config_json')
                    .eq('id', businessId)
                    .single();

                  if (error || !data) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Business not found' }));
                    return;
                  }

                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(data.config_json));
                } catch (error: any) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Failed to load business config' }));
                }
                return;
              }

              // Handle GET /api/businesses (list all)
              if (method === 'GET' && url === '/api/businesses') {
                try {
                  if (!supabase) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                      error: 'Supabase not configured',
                      message: 'Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables'
                    }));
                    return;
                  }

                  const { data, error } = await supabase
                    .from('businesses')
                    .select('id, name, domain, created_at, updated_at')
                    .order('created_at', { ascending: false });

                  if (error) {
                    console.error('Supabase query error:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                      error: 'Failed to load businesses',
                      details: error.message,
                      code: error.code,
                      hint: error.hint || null
                    }));
                    return;
                  }

                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(data || []));
                } catch (error: any) {
                  console.error('Error loading businesses:', error);
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ 
                    error: 'Failed to load businesses',
                    details: error.message || 'Unknown error'
                  }));
                }
                return;
              }

              // Handle GET /api/businesses/:id (get single)
              if (method === 'GET' && url.startsWith('/api/businesses/')) {
                const urlParts = url.split('/');
                const businessId = urlParts[3];

                try {
                  const { data, error } = await supabase
                    .from('businesses')
                    .select('id, name, domain, config_json, preview_data_json, contact_info_json, preview_screenshot_url, created_at, updated_at')
                    .eq('id', businessId)
                    .single();

                  if (error || !data) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Business not found' }));
                    return;
                  }

                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(data));
                } catch (error: any) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Failed to load business' }));
                }
                return;
              }

              // Handle POST /api/businesses (create or update)
              if (method === 'POST' && url === '/api/businesses') {
                let body = '';
                req.on('data', (chunk) => {
                  body += chunk.toString();
                });
                req.on('end', async () => {
                  try {
                    const payload = JSON.parse(body);
                    
                    // Use upsert to handle both create and update
                    const { data, error } = await supabase
                      .from('businesses')
                      .upsert({
                        id: payload.id,
                        name: payload.name,
                        domain: payload.domain,
                        config_json: payload.config_json,
                        preview_data_json: payload.preview_data_json || null,
                        contact_info_json: payload.contact_info_json || null,
                      }, {
                        onConflict: 'id'
                      })
                      .select()
                      .single();

                    if (error) {
                      throw error;
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(data));
                  } catch (error: any) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: error.message || 'Failed to save business' }));
                  }
                });
                return;
              }

              // Handle PUT /api/businesses/:id (update)
              if (method === 'PUT' && url.startsWith('/api/businesses/')) {
                const urlParts = url.split('/');
                const businessId = urlParts[3];
                let body = '';
                req.on('data', (chunk) => {
                  body += chunk.toString();
                });
                req.on('end', async () => {
                  try {
                    const payload = JSON.parse(body);
                    const { data, error } = await supabase
                      .from('businesses')
                      .update({
                        name: payload.name,
                        domain: payload.domain,
                        config_json: payload.config_json,
                        preview_data_json: payload.preview_data_json || null,
                        contact_info_json: payload.contact_info_json || null,
                      })
                      .eq('id', businessId)
                      .select()
                      .single();

                    if (error) {
                      throw error;
                    }

                    if (!data) {
                      res.writeHead(404, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: 'Business not found' }));
                      return;
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(data));
                  } catch (error: any) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: error.message || 'Failed to update business' }));
                  }
                });
                return;
              }

              // Handle DELETE /api/businesses/:id
              if (method === 'DELETE' && url.startsWith('/api/businesses/')) {
                const urlParts = url.split('/');
                const businessId = urlParts[3];

                try {
                  const { error } = await supabase
                    .from('businesses')
                    .delete()
                    .eq('id', businessId);

                  if (error) {
                    throw error;
                  }

                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: true }));
                } catch (error: any) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: error.message || 'Failed to delete business' }));
                }
                return;
              }

              // Handle POST /api/scrape-website
              if (method === 'POST' && url === '/api/scrape-website') {
                let body = '';
                req.on('data', (chunk) => {
                  body += chunk.toString();
                });
                req.on('end', async () => {
                  try {
                    const payload = JSON.parse(body);
                    const { url: websiteUrl, businessId, domain } = payload;

                    if (!websiteUrl || !businessId) {
                      res.writeHead(400, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: 'URL and businessId are required' }));
                      return;
                    }

                    // Get API keys from environment
                    const firecrawlApiKey = env.FIRECRAWL_API_KEY;
                    const geminiApiKey = env.GEMINI_API_KEY;

                    if (!firecrawlApiKey || !geminiApiKey) {
                      res.writeHead(500, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: 'API keys not configured' }));
                      return;
                    }

                    // Import and run scraping pipeline
                    const { runScrapingPipeline } = await import('./api/_lib/scrapingPipeline.js');
                    const result = await runScrapingPipeline({
                      url: websiteUrl,
                      businessId,
                      domain: domain || '',
                      firecrawlApiKey,
                      geminiApiKey,
                    });

                    if (result.error) {
                      res.writeHead(500, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: result.error }));
                      return;
                    }

                    if (!result.config) {
                      res.writeHead(500, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ error: 'Failed to generate config' }));
                      return;
                    }

                    // Save config, previewData, contactInfo, and screenshot URL to database using upsert
                    // This will update if exists, create if new
                    const { error: upsertError } = await supabase
                      .from('businesses')
                      .upsert({
                        id: businessId,
                        name: result.config.name,
                        domain: domain || '',
                        config_json: result.config,
                        preview_data_json: result.previewData || null,
                        contact_info_json: result.contactInfo || null,
                        preview_screenshot_url: result.screenshotUrl || null,
                      }, {
                        onConflict: 'id'
                      });

                    if (upsertError) {
                      console.error('Failed to save business:', upsertError);
                      // Still return the data even if save fails
                    }

                    // Return config, previewData, contactInfo, and screenshotUrl
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                      config: result.config,
                      previewData: result.previewData,
                      contactInfo: result.contactInfo,
                      screenshotUrl: result.screenshotUrl
                    }));
                  } catch (error: any) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: error.message || 'Scraping failed' }));
                  }
                });
                return;
              }

              next();
            });
          }
        }
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        __BUILD_TIMESTAMP__: JSON.stringify(Date.now())
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
