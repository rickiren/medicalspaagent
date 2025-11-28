import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    // Import and run scraping pipeline
    // Vercel automatically transpiles TypeScript, so we can import .ts files
    // Use relative path from api folder (one level up to project root, then into utils)
    const { runScrapingPipeline } = await import('../utils/scrapingPipeline');
    const result = await runScrapingPipeline({
      url: websiteUrl,
      businessId,
      domain: domain || '',
      firecrawlApiKey,
      geminiApiKey,
    });

    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    if (!result.config) {
      return res.status(500).json({ error: 'Failed to generate config' });
    }

    // Save to database
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase credentials not configured' });
    }

    const client = createClient(supabaseUrl, supabaseKey);
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
    return res.status(500).json({ error: error.message || 'Scraping failed' });
  }
}

