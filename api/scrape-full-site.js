/**
 * API Endpoint: Scrape Full Site
 * 
 * POST /api/scrape-full-site
 * 
 * Scrapes the entire website once using Firecrawl's crawl mode
 * and stores raw HTML and text in Supabase.
 * 
 * Body:
 * {
 *   "leadId": "lead-id",        // optional, use with leads table
 *   "businessId": "business-id", // optional, use with businesses table
 *   "url": "https://example.com"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": { ... stored record ... }
 * }
 */

import { crawlFullSite } from './_lib/firecrawlCrawler.js';
import { storeRawCrawlData } from './_lib/firecrawlStorage.js';

export default async function handler(req, res) {
  console.log('[SCRAPE-FULL-SITE] Request received:', {
    method: req.method,
    hasBody: !!req.body,
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { leadId, businessId, url } = req.body;

    if (!url) {
      return res.status(400).json({ 
        error: 'url is required' 
      });
    }

    if (!leadId && !businessId) {
      return res.status(400).json({ 
        error: 'Either leadId or businessId is required' 
      });
    }

    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    if (!firecrawlApiKey) {
      return res.status(500).json({ 
        error: 'FIRECRAWL_API_KEY not configured' 
      });
    }

    const idType = leadId ? 'lead' : 'business';
    const idValue = leadId || businessId;
    console.log('[SCRAPE-FULL-SITE] Starting full-site crawl:', { [idType + 'Id']: idValue, url });

    // Step 1: Crawl full site
    const crawlData = await crawlFullSite(url, firecrawlApiKey);
    console.log('[SCRAPE-FULL-SITE] Crawl complete:', {
      pagesCount: crawlData.pages?.length || 0,
      rawTextLength: crawlData.rawText?.length || 0,
    });

    // Step 2: Store raw data in Supabase
    const storedData = await storeRawCrawlData({ leadId, businessId, crawlData });
    console.log('[SCRAPE-FULL-SITE] Data stored:', storedData.id);

    return res.status(200).json({
      success: true,
      data: storedData,
      stats: {
        pagesCrawled: crawlData.pages?.length || 0,
        rawTextLength: crawlData.rawText?.length || 0,
        rawHtmlLength: crawlData.rawHtml?.length || 0,
      },
    });
  } catch (error) {
    console.error('[SCRAPE-FULL-SITE] Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to scrape full site' 
    });
  }
}

