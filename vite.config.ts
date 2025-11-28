import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Initialize Supabase client
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_ANON_KEY;
    const supabase = supabaseUrl && supabaseKey 
      ? createClient(supabaseUrl, supabaseKey)
      : null;
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        middlewareMode: false,
      },
      plugins: [
        react(),
        {
          name: 'business-config-api',
          configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
              if (!supabase) {
                if (req.url?.startsWith('/api/')) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Supabase not configured' }));
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
                  const { data, error } = await supabase
                    .from('businesses')
                    .select('id, name, domain, created_at, updated_at')
                    .order('created_at', { ascending: false });

                  if (error) {
                    throw error;
                  }

                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(data || []));
                } catch (error: any) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Failed to load businesses' }));
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
                    .select('*')
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

              // Handle POST /api/businesses (create)
              if (method === 'POST' && url === '/api/businesses') {
                let body = '';
                req.on('data', (chunk) => {
                  body += chunk.toString();
                });
                req.on('end', async () => {
                  try {
                    const payload = JSON.parse(body);
                    const { data, error } = await supabase
                      .from('businesses')
                      .insert({
                        id: payload.id,
                        name: payload.name,
                        domain: payload.domain,
                        config_json: payload.config_json,
                      })
                      .select()
                      .single();

                    if (error) {
                      throw error;
                    }

                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(data));
                  } catch (error: any) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: error.message || 'Failed to create business' }));
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
                    const { runScrapingPipeline } = await import('./utils/scrapingPipeline.js');
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

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ config: result.config }));
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
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
