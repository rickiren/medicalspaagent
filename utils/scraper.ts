import FirecrawlApp from '@mendable/firecrawl-js';
import { BusinessConfig } from '../types';

export interface ScrapeResult {
  markdown: string;
  links: string[];
  metadata?: any;
}

export async function scrapeWebsite(url: string, apiKey: string): Promise<ScrapeResult> {
  const app = new FirecrawlApp({ apiKey });

  try {
    // Firecrawl v1 API - use no options (pageOptions and scrapeOptions are not supported)
    // The API will return markdown by default
    const scrapeResult = await app.scrapeUrl(url);

    // Handle different response structures
    const data = scrapeResult.data || scrapeResult;
    
    return {
      markdown: data.markdown || data.content || '',
      links: data.links || [],
      metadata: data.metadata,
    };
  } catch (error: any) {
    throw new Error(`Firecrawl scraping failed: ${error.message}`);
  }
}
