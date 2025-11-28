import FirecrawlApp from '@mendable/firecrawl-js';

export interface ScrapeResult {
  markdown: string;
  links: string[];
  images?: string[];
  metadata?: any;
  rawData?: any; // Full Firecrawl response for additional processing
}

export async function scrapeWebsite(url: string, apiKey: string): Promise<ScrapeResult> {
  const app = new FirecrawlApp({ apiKey });

  try {
    // Enhanced Firecrawl scrape with more extraction options
    // Note: Firecrawl v1 may have different parameter names, so we'll try both
    let scrapeResult;
    
    try {
      // Try with enhanced options first (formats and extract)
      // Note: "images" is not a valid Firecrawl format - we extract images from response data instead
      scrapeResult = await app.scrapeUrl(url, {
        formats: ['markdown', 'links', 'rawHtml'],
      });
    } catch (e) {
      // Fallback to basic scrape
      try {
        scrapeResult = await app.scrapeUrl(url, {
          formats: ['markdown', 'links'],
        });
      } catch (e2) {
        // Final fallback
        scrapeResult = await app.scrapeUrl(url);
      }
    }

    // Handle different response structures
    const data = scrapeResult.data || scrapeResult;
    
    // Extract images from various possible locations
    const images: string[] = [];
    if (data.images && Array.isArray(data.images)) {
      images.push(...data.images);
    }
    if (data.metadata?.images && Array.isArray(data.metadata.images)) {
      images.push(...data.metadata.images);
    }
    
    // Extract links - handle both array of strings and array of objects
    const links: string[] = [];
    if (data.links) {
      if (Array.isArray(data.links)) {
        data.links.forEach((link: any) => {
          if (typeof link === 'string') {
            links.push(link);
          } else if (link.url) {
            links.push(link.url);
          } else if (link.href) {
            links.push(link.href);
          }
        });
      }
    }
    
    return {
      markdown: data.markdown || data.content || '',
      links: links.length > 0 ? links : [],
      images: images.length > 0 ? images : undefined,
      metadata: data.metadata,
      rawData: {
        ...data,
        html: data.html || data.rawHtml || '',
        rawHtml: data.rawHtml || data.html || '',
      }, // Store full response for additional processing
    };
  } catch (error: any) {
    throw new Error(`Firecrawl scraping failed: ${error.message}`);
  }
}
