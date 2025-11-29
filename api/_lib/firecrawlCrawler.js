/**
 * Firecrawl Full Crawl Service
 * 
 * Performs a full-site crawl using Firecrawl's crawl mode.
 * This scrapes the entire website once and returns raw HTML and text.
 * 
 * IMPORTANT: This is a one-time crawl. Store the results in Supabase
 * and extract from stored data later to avoid paying for multiple crawls.
 */

export async function crawlFullSite(url, apiKey) {
  if (!url || !apiKey) {
    throw new Error('URL and Firecrawl API key are required');
  }

  try {
    console.log('[FIRECRAWL-CRAWLER] Starting full-site crawl:', url);

    // Step 1: Start crawl job using /v1/crawl endpoint
    // CRITICAL: Medspas block bots, so we MUST set ignoreRobotsTxt: true
    // Without this, Firecrawl will get stuck in "scraping" status forever
    const startResponse = await fetch('https://api.firecrawl.dev/v1/crawl', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        maxDepth: 1,              // Limit to ~5 pages, avoid infinite crawl
        ignoreRobotsTxt: true,    // 🔥 REQUIRED: Medspas block bots in robots.txt
        includeSubdomains: false, // Limit scope to main domain
        waitFor: 2000,            // Allow JS-based sites to load
        javascript: true,         // Enable JS rendering (Elementor/React/etc.)
      }),
    });

    if (!startResponse.ok) {
      const errorText = await startResponse.text();
      console.error('[FIRECRAWL-CRAWLER] API error:', startResponse.status, errorText);
      throw new Error(`Firecrawl API error: ${startResponse.status} - ${errorText}`);
    }

    const startResult = await startResponse.json();
    const jobId = startResult.id;
    const pollUrl = startResult.url;

    if (!jobId || !pollUrl) {
      console.error('[FIRECRAWL-CRAWLER] No id or url returned:', startResult);
      throw new Error('Firecrawl did not return an id or polling url. Response: ' + JSON.stringify(startResult));
    }

    console.log('[FIRECRAWL-CRAWLER] Crawl job started, id:', jobId, 'pollUrl:', pollUrl);

    // Step 2: Poll for results using the URL provided by Firecrawl
    return await pollCrawlJob(pollUrl, apiKey);
  } catch (error) {
    console.error('[FIRECRAWL-CRAWLER] Crawl failed:', error);
    throw new Error(`Full-site crawl failed: ${error.message}`);
  }
}

/**
 * Poll for crawl job completion
 */
async function pollCrawlJob(pollUrl, apiKey, maxAttempts = 120, intervalMs = 1000) {
  console.log('[FIRECRAWL-CRAWLER] Polling for job completion, pollUrl:', pollUrl);
  const startTime = Date.now();
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Wait before polling (except first attempt)
    if (attempt > 0) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    
    try {
      // Poll using the URL provided by Firecrawl
      const response = await fetch(pollUrl, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'completed') {
        const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
        console.log(`[FIRECRAWL-CRAWLER] Job completed! (took ${elapsedSeconds}s)`);
        console.log('[FIRECRAWL-CRAWLER] Response structure:', {
          hasData: !!data.data,
          dataKeys: data.data ? Object.keys(data.data) : [],
          hasPages: !!(data.data?.pages),
          pagesCount: data.data?.pages?.length || 0,
          firstPageKeys: data.data?.pages?.[0] ? Object.keys(data.data.pages[0]) : [],
        });
        return formatCrawlResult(data);
      } else if (data.status === 'failed') {
        throw new Error(`Crawl job failed: ${data.error || 'Unknown error'}`);
      }
      
      // Still in progress (status might be 'running', 'pending', or 'scraping')
      const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
      const elapsedMinutes = Math.round(elapsedSeconds / 60);
      
      // Show progress info if available
      const progressInfo = data.progress ? ` (${data.progress.pagesScraped || 0} pages)` : '';
      const statusInfo = data.status === 'scraping' ? 'scraping' : data.status;
      
      // Log more frequently for better visibility (every 5 attempts)
      if (attempt % 5 === 0 || attempt < 5) {
        console.log(`[FIRECRAWL-CRAWLER] Status: ${statusInfo}${progressInfo} | Attempt ${attempt + 1}/${maxAttempts} | Elapsed: ${elapsedMinutes}m ${elapsedSeconds % 60}s`);
      }
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw error;
      }
      console.warn('[FIRECRAWL-CRAWLER] Polling error, retrying...', error.message);
    }
  }
  
  const elapsedMinutes = Math.round((Date.now() - startTime) / 60000);
  throw new Error(`Crawl job timed out after ${elapsedMinutes} minutes (${maxAttempts} attempts)`);
}

/**
 * Format crawl result into consistent structure
 * 
 * Expected Firecrawl response format:
 * {
 *   "rawHtml": "<html>...</html>",
 *   "rawText": "full plaintext of page",
 *   "pages": [
 *     { "url": "...", "rawHtml": "...", "rawText": "..." }
 *   ]
 * }
 */
function formatCrawlResult(result) {
  // Log the full result structure for debugging
  console.log('[FIRECRAWL-CRAWLER] Formatting result, structure:', {
    hasData: !!result.data,
    topLevelKeys: Object.keys(result),
    dataKeys: result.data ? Object.keys(result.data) : [],
  });

  // Extract data from various possible response formats
  const data = result.data || result;
  
  // Handle /v1/crawl endpoint response format
  // Firecrawl v1 returns: { status: 'completed', data: { pages: [...] } }
  if (data.pages && Array.isArray(data.pages)) {
    console.log('[FIRECRAWL-CRAWLER] Processing pages array, count:', data.pages.length);
    
    const pages = data.pages.map((page, index) => {
      // Log first page structure to understand what fields are available
      if (index === 0) {
        console.log('[FIRECRAWL-CRAWLER] First page structure:', {
          keys: Object.keys(page),
          hasHtml: !!(page.html || page.rawHtml),
          hasMarkdown: !!page.markdown,
          hasContent: !!page.content,
        });
      }
      
      // Firecrawl v1 returns: page.html, page.markdown, page.text
      // Use markdown as primary text (it's more structured), fallback to text
      const rawHtml = page.html || '';
      const rawText = page.markdown || page.text || '';
      
      return {
        url: page.url || '',
        rawHtml: rawHtml,
        rawText: rawText,
        metadata: page.meta || page.metadata || {},
      };
    });
    
    const mainPageHtml = pages[0]?.rawHtml || '';
    const mainPageText = pages[0]?.rawText || '';
    
    console.log('[FIRECRAWL-CRAWLER] Extracted data:', {
      pagesCount: pages.length,
      mainPageHtmlLength: mainPageHtml.length,
      mainPageTextLength: mainPageText.length,
      allPagesHaveHtml: pages.every(p => p.rawHtml.length > 0),
      allPagesHaveText: pages.every(p => p.rawText.length > 0),
    });
    
    const combinedText = pages
      .map(p => p.rawText)
      .filter(Boolean)
      .join('\n\n---\n\n');

    // Validate we actually got data
    if (pages.length === 0) {
      console.warn('[FIRECRAWL-CRAWLER] No pages found in response');
      throw new Error('Crawl completed but no pages were returned');
    }
    
    if (!mainPageHtml && !mainPageText) {
      console.warn('[FIRECRAWL-CRAWLER] No HTML or text content found in pages');
      // Log the actual page structure for debugging
      console.log('[FIRECRAWL-CRAWLER] First page content:', JSON.stringify(pages[0], null, 2).substring(0, 500));
    }
    
    return {
      rawHtml: mainPageHtml,
      rawText: combinedText || mainPageText,
      pages: pages,
      metadata: {
        totalPages: pages.length,
        urls: pages.map(p => p.url),
        crawlStats: result.stats || {},
        ...(result.metadata || data.metadata || {}),
      },
    };
  }
  
  // Handle direct format with rawHtml/rawText at top level
  if (data.rawHtml || data.rawText) {
    const pages = Array.isArray(data.pages) ? data.pages : [];
    
    // If we have top-level rawHtml/rawText, use those as main page
    const mainPageHtml = data.rawHtml || '';
    const mainPageText = data.rawText || '';
    
    // Ensure pages array includes the main page if not already included
    if (pages.length === 0 && (mainPageHtml || mainPageText)) {
      pages.push({
        url: data.url || data.sourceURL || '',
        rawHtml: mainPageHtml,
        rawText: mainPageText,
        metadata: data.metadata || {},
      });
    }
    
    // Combine all text from pages for extraction
    const combinedText = pages
      .map(p => p.rawText || p.raw_text || '')
      .filter(Boolean)
      .join('\n\n---\n\n') || mainPageText;

    return {
      rawHtml: mainPageHtml,
      rawText: combinedText || mainPageText,
      pages: pages,
      metadata: {
        totalPages: pages.length,
        urls: pages.map(p => p.url || ''),
        crawlStats: result.stats || {},
        ...(result.metadata || data.metadata || {}),
      },
    };
  }
  
  // Handle array of pages format
  if (Array.isArray(data)) {
    const pages = data.map((page) => ({
      url: page.url || page.sourceURL || '',
      rawHtml: page.rawHtml || page.html || '',
      rawText: page.rawText || page.markdown || page.content || '',
      metadata: page.metadata || {},
    }));
    
    const mainPageHtml = pages[0]?.rawHtml || '';
    const mainPageText = pages[0]?.rawText || '';
    
    const combinedText = pages
      .map(p => p.rawText)
      .filter(Boolean)
      .join('\n\n---\n\n');

    return {
      rawHtml: mainPageHtml,
      rawText: combinedText || mainPageText,
      pages: pages,
      metadata: {
        totalPages: pages.length,
        urls: pages.map(p => p.url),
        crawlStats: result.stats || {},
        ...(result.metadata || {}),
      },
    };
  }
  
  // Fallback: try to extract from single page object
  const mainPageHtml = data.html || data.rawHtml || data.sourceHTML || '';
  const mainPageText = data.markdown || data.content || data.rawText || data.text || '';
  
  // If we still don't have data, log the entire result for debugging
  if (!mainPageHtml && !mainPageText) {
    console.error('[FIRECRAWL-CRAWLER] No data found in any format. Full result:', JSON.stringify(result, null, 2).substring(0, 1000));
    throw new Error('Crawl completed but no HTML or text content was found in the response');
  }
  
  return {
    rawHtml: mainPageHtml,
    rawText: mainPageText,
    pages: [{
      url: data.url || data.sourceURL || '',
      rawHtml: mainPageHtml,
      rawText: mainPageText,
      metadata: data.metadata || {},
    }],
    metadata: {
      totalPages: 1,
      urls: [data.url || data.sourceURL || ''],
      crawlStats: result.stats || {},
      ...(result.metadata || data.metadata || {}),
    },
  };
}

