const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Middleware to handle /api prefix from Firebase Hosting rewrites
// When called via hosting rewrite, the path includes /api, so we need to handle it
app.use((req, res, next) => {
  // If path starts with /api, remove it so routes match
  if (req.path.startsWith('/api/')) {
    req.url = req.url.replace('/api', '');
  }
  next();
});

// Initialize Supabase client
// Note: Using environment variables directly (functions.config() is deprecated)
const getSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const error = new Error('Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    console.error('Missing Supabase credentials:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey
    });
    throw error;
  }

  return createClient(supabaseUrl, supabaseKey);
};

// GET /api/businesses - List all businesses
// Handle both /businesses (direct call) and /api/businesses (via hosting rewrite)
app.get('/businesses', async (req, res) => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('businesses')
      .select('id, name, domain, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to load businesses',
        details: error.message,
        code: error.code 
      });
    }

    return res.status(200).json(data || []);
  } catch (err) {
    console.error('Server error:', err);
    // Always return JSON, even for errors
    return res.status(500).json({ 
      error: err.message || 'Internal server error',
      details: 'Please check function logs for more details'
    });
  }
});

// POST /api/businesses - Create or update business
app.post('/businesses', async (req, res) => {
  try {
    const client = getSupabaseClient();
    const payload = req.body;

    const { data, error } = await client
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
      console.error('Supabase error:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /api/businesses/:id - Get single business
app.get('/businesses/:id', async (req, res) => {
  try {
    const client = getSupabaseClient();
    const { id } = req.params;

    const { data, error } = await client
      .from('businesses')
      .select('id, name, domain, config_json, preview_data_json, contact_info_json, preview_screenshot_url, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Business not found' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// PUT /api/businesses/:id - Update business
app.put('/businesses/:id', async (req, res) => {
  try {
    const client = getSupabaseClient();
    const { id } = req.params;
    const payload = req.body;

    const { data, error } = await client
      .from('businesses')
      .update({
        name: payload.name,
        domain: payload.domain,
        config_json: payload.config_json,
        preview_data_json: payload.preview_data_json || null,
        contact_info_json: payload.contact_info_json || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Business not found' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// DELETE /api/businesses/:id - Delete business
app.delete('/businesses/:id', async (req, res) => {
  try {
    const client = getSupabaseClient();
    const { id } = req.params;

    const { error } = await client
      .from('businesses')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /api/business/:id/config - Get business config
app.get('/business/:id/config', async (req, res) => {
  try {
    const client = getSupabaseClient();
    const { id } = req.params;

    const { data, error } = await client
      .from('businesses')
      .select('config_json')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Business not found' });
    }

    return res.status(200).json(data.config_json);
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Failed to load business config' });
  }
});

// GET /api/business/:id/preview - Get business preview
app.get('/business/:id/preview', async (req, res) => {
  try {
    const client = getSupabaseClient();
    const { id } = req.params;

    const { data, error } = await client
      .from('businesses')
      .select('id, name, domain, preview_screenshot_url, preview_data_json')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const response = {
      businessId: data.id,
      businessName: data.name,
      domain: data.domain,
      screenshotUrl: data.preview_screenshot_url || null,
      previewData: data.preview_data_json || null
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// POST /api/scrape-website - Scrape website
app.post('/scrape-website', async (req, res) => {
  try {
    const { url: websiteUrl, businessId, domain } = req.body;

    if (!websiteUrl || !businessId) {
      return res.status(400).json({ error: 'URL and businessId are required' });
    }

    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!firecrawlApiKey || !geminiApiKey) {
      return res.status(500).json({ error: 'API keys not configured' });
    }

    // Set environment variables for the scraping pipeline
    // These will be used by the screenshot capture function
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    // Temporarily set env vars for the pipeline (they'll be read by screenshotCapture)
    const originalSupabaseUrl = process.env.SUPABASE_URL;
    const originalSupabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const originalSupabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    if (supabaseUrl) process.env.SUPABASE_URL = supabaseUrl;
    if (supabaseServiceRoleKey) process.env.SUPABASE_SERVICE_ROLE_KEY = supabaseServiceRoleKey;
    if (supabaseAnonKey) process.env.SUPABASE_ANON_KEY = supabaseAnonKey;

    // Import scraping pipeline using dynamic import (ES modules)
    const scrapingPipelineModule = await import('./lib/scrapingPipeline.js');
    const { runScrapingPipeline } = scrapingPipelineModule;
    
    const result = await runScrapingPipeline({
      url: websiteUrl,
      businessId,
      domain: domain || '',
      firecrawlApiKey,
      geminiApiKey,
    });
    
    // Restore original env vars
    if (originalSupabaseUrl !== undefined) process.env.SUPABASE_URL = originalSupabaseUrl;
    if (originalSupabaseServiceRoleKey !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = originalSupabaseServiceRoleKey;
    if (originalSupabaseAnonKey !== undefined) process.env.SUPABASE_ANON_KEY = originalSupabaseAnonKey;

    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    if (!result.config) {
      return res.status(500).json({ error: 'Failed to generate config' });
    }

    // Save to database
    const client = getSupabaseClient();
    const { error: upsertError } = await client
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
    }

    return res.status(200).json({
      config: result.config,
      previewData: result.previewData,
      contactInfo: result.contactInfo,
      screenshotUrl: result.screenshotUrl
    });
  } catch (error) {
    console.error('Scraping error:', error);
    return res.status(500).json({
      error: error.message || 'Scraping failed'
    });
  }
});

// Error handling middleware - must be after all routes
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  // Always return JSON, never plain text
  if (!res.headersSent) {
    res.status(500).json({ 
      error: err.message || 'Internal server error',
      details: 'An unexpected error occurred'
    });
  }
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.path 
  });
});

// Export the Express app as a Firebase Cloud Function (1st Gen)
// Declare secrets that this function will use
exports.api = functions.runWith({
  secrets: [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'FIRECRAWL_API_KEY',
    'GEMINI_API_KEY',
    'OPENAI_API_KEY'
  ],
  timeoutSeconds: 540,
  memory: '1GB'
}).https.onRequest(app);

