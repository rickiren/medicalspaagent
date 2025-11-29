/**
 * Full Site Scraper - Main Module
 * 
 * This is the main entry point that combines:
 * 1. Full-site crawl using Firecrawl
 * 2. Storage of raw HTML/text in Supabase
 * 
 * Usage:
 *   await scrapeFullSite({ leadId: 'lead-id', url: 'https://...' })
 *   await scrapeFullSite({ businessId: 'business-id', url: 'https://...' })
 * 
 * This function:
 * - Crawls the entire website once
 * - Stores raw HTML and text in Supabase
 * - Returns the stored record
 * 
 * After this, you can run extractBusinessConfig() unlimited times
 * without paying for another crawl.
 */

import { crawlFullSite } from './firecrawlCrawler.js';
import { storeRawCrawlData } from './firecrawlStorage.js';

/**
 * Scrape full site and store raw data
 * 
 * @param {Object} options - Options object
 * @param {string} options.leadId - Lead ID (optional, use with leads table)
 * @param {string} options.businessId - Business ID (optional, use with businesses table)
 * @param {string} options.url - Website URL to crawl
 * @returns {Promise<Object>} Stored record from Supabase
 */
export async function scrapeFullSite({ leadId, businessId, url }) {
  if (!url) {
    throw new Error('url is required');
  }

  if (!leadId && !businessId) {
    throw new Error('Either leadId or businessId is required');
  }

  const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
  if (!firecrawlApiKey) {
    throw new Error('FIRECRAWL_API_KEY environment variable is not set');
  }

  const idType = leadId ? 'lead' : 'business';
  const idValue = leadId || businessId;
  console.log('[FULL-SITE-SCRAPER] Starting scrape:', { [idType + 'Id']: idValue, url });

  // Step 1: Crawl full site
  const crawlData = await crawlFullSite(url, firecrawlApiKey);

  // Step 2: Store raw data
  const storedData = await storeRawCrawlData({ leadId, businessId, crawlData });

  console.log('[FULL-SITE-SCRAPER] Scrape complete:', {
    recordId: storedData.id,
    pagesCount: crawlData.pages?.length || 0,
  });

  return storedData;
}

