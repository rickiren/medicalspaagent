import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  console.log('[SCRAPE-WEBSITE] Request received:', {
    method: req.method,
    hasBody: !!req.body,
    bodyKeys: req.body ? Object.keys(req.body) : []
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url: websiteUrl, businessId, domain } = req.body;
    console.log('[SCRAPE-WEBSITE] Input params:', { websiteUrl, businessId, domain });

    if (!websiteUrl || !businessId) {
      console.error('[SCRAPE-WEBSITE] Missing required params');
      return res.status(400).json({ error: 'URL and businessId are required' });
    }

    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const hasFirecrawl = !!firecrawlApiKey;
    const hasGemini = !!geminiApiKey;
    console.log('[SCRAPE-WEBSITE] API keys check:', { hasFirecrawl, hasGemini });

    if (!firecrawlApiKey || !geminiApiKey) {
      console.error('[SCRAPE-WEBSITE] API keys not configured');
      return res.status(500).json({ error: 'API keys not configured' });
    }

    // Import and run scraping pipeline
    // Try importing the original TypeScript pipeline
    console.log('[SCRAPE-WEBSITE] Importing scraping pipeline...');
    let runScrapingPipeline;
    try {
      // Try importing the original TypeScript pipeline
      // TypeScript should be transpiled automatically
      const pipelineModule = await import('../utils/scrapingPipeline');
      runScrapingPipeline = pipelineModule.runScrapingPipeline;
      console.log('[SCRAPE-WEBSITE] Successfully imported scraping pipeline');
    } catch (importError) {
      console.error('[SCRAPE-WEBSITE] Failed to import scraping pipeline:', importError);
      console.error('[SCRAPE-WEBSITE] Import error details:', {
        message: importError.message,
        stack: importError.stack,
        code: importError.code
      });
      return res.status(500).json({ 
        error: 'Failed to import scraping pipeline',
        details: importError.message,
        code: importError.code
      });
    }

    console.log('[SCRAPE-WEBSITE] Running scraping pipeline...');
    const result = await runScrapingPipeline({
      url: websiteUrl,
      businessId,
      domain: domain || '',
      firecrawlApiKey,
      geminiApiKey,
    });

    console.log('[SCRAPE-WEBSITE] Pipeline result:', {
      hasConfig: !!result.config,
      hasPreviewData: !!result.previewData,
      hasContactInfo: !!result.contactInfo,
      screenshotUrl: result.screenshotUrl || 'null',
      hasError: !!result.error,
      error: result.error
    });

    if (result.error) {
      console.error('[SCRAPE-WEBSITE] Pipeline error:', result.error);
      return res.status(500).json({ error: result.error });
    }

    if (!result.config) {
      console.error('[SCRAPE-WEBSITE] No config generated');
      return res.status(500).json({ error: 'Failed to generate config' });
    }

    // Save to database
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    console.log('[SCRAPE-WEBSITE] Supabase check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey
    });

    if (!supabaseUrl || !supabaseKey) {
      console.error('[SCRAPE-WEBSITE] Supabase credentials not configured');
      return res.status(500).json({ error: 'Supabase credentials not configured' });
    }

    const client = createClient(supabaseUrl, supabaseKey);
    console.log('[SCRAPE-WEBSITE] Saving to database, screenshotUrl:', result.screenshotUrl);
    
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
      console.error('[SCRAPE-WEBSITE] Failed to save business:', upsertError);
    } else {
      console.log('[SCRAPE-WEBSITE] Successfully saved business to database');
    }

    const response = {
      config: result.config,
      previewData: result.previewData,
      contactInfo: result.contactInfo,
      screenshotUrl: result.screenshotUrl
    };
    console.log('[SCRAPE-WEBSITE] Returning response, screenshotUrl:', response.screenshotUrl);
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('[SCRAPE-WEBSITE] Unexpected error:', error);
    console.error('[SCRAPE-WEBSITE] Error stack:', error.stack);
    return res.status(500).json({ 
      error: error.message || 'Scraping failed',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

