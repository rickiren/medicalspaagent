import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from './_lib/supabase';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { url: websiteUrl, businessId, domain } = req.body;

    if (!websiteUrl || !businessId) {
      res.status(400).json({ error: 'URL and businessId are required' });
      return;
    }

    // Get API keys from environment
    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!firecrawlApiKey || !geminiApiKey) {
      res.status(500).json({ error: 'API keys not configured' });
      return;
    }

    // Import and run scraping pipeline
    // Use dynamic import with proper path resolution for Vercel
    const { runScrapingPipeline } = await import('../utils/scrapingPipeline.js');
    const result = await runScrapingPipeline({
      url: websiteUrl,
      businessId,
      domain: domain || '',
      firecrawlApiKey,
      geminiApiKey,
    });

    if (result.error) {
      res.status(500).json({ error: result.error });
      return;
    }

    if (!result.config) {
      res.status(500).json({ error: 'Failed to generate config' });
      return;
    }

    // Save config, previewData, contactInfo, and screenshot URL to database using upsert
    const supabase = getSupabaseClient();
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
    res.status(200).json({ 
      config: result.config,
      previewData: result.previewData,
      contactInfo: result.contactInfo,
      screenshotUrl: result.screenshotUrl
    });
  } catch (error: any) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: error.message || 'Scraping failed' });
  }
}

