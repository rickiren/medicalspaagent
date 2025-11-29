import FirecrawlApp from '@mendable/firecrawl-js';

export async function scrapeWebsite(url, apiKey) {
  const app = new FirecrawlApp({ apiKey });

  try {
    let scrapeResult;
    
    try {
      // Note: "images" is not a valid Firecrawl format - we extract images from response data instead
      scrapeResult = await app.scrapeUrl(url, {
        formats: ['markdown', 'links', 'rawHtml'],
      });
    } catch (e) {
      try {
        scrapeResult = await app.scrapeUrl(url, {
          formats: ['markdown', 'links'],
        });
      } catch (e2) {
        scrapeResult = await app.scrapeUrl(url);
      }
    }

    const data = scrapeResult.data || scrapeResult;
    
    // Extract images from various possible locations
    const images = [];
    if (data.images && Array.isArray(data.images)) {
      images.push(...data.images);
    }
    if (data.metadata?.images && Array.isArray(data.metadata.images)) {
      images.push(...data.metadata.images);
    }
    
    // Extract links
    const links = [];
    if (data.links) {
      if (Array.isArray(data.links)) {
        data.links.forEach((link) => {
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
      },
    };
  } catch (error) {
    throw new Error(`Firecrawl scraping failed: ${error.message}`);
  }
}

