import { scrapeWebsite } from './scraper';
import { normalizeToBusinessConfig } from './normalizer';
import { BusinessConfig } from '../types';

// Simplified pipeline runner (no LangGraph needed for this simple flow)
export async function runScrapingPipeline(params: {
  url: string;
  businessId: string;
  domain: string;
  firecrawlApiKey: string;
  geminiApiKey: string;
}): Promise<{ config?: BusinessConfig; error?: string }> {
  try {
    // Step 1: Scrape website
    const scrapeResult = await scrapeWebsite(params.url, params.firecrawlApiKey);
    
    // Step 2: Normalize to BusinessConfig
    const config = await normalizeToBusinessConfig(
      scrapeResult.markdown,
      params.businessId,
      params.domain,
      params.geminiApiKey
    );
    
    return { config };
  } catch (error: any) {
    return { error: error.message };
  }
}

