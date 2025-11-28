// JavaScript version of scraping pipeline for Vercel serverless functions
// This avoids TypeScript import issues in serverless environment

export async function runScrapingPipeline(params) {
  const { url, businessId, domain, firecrawlApiKey, geminiApiKey } = params;
  
  try {
    console.log('[PIPELINE] Starting pipeline:', { url, businessId, domain });
    
    // Dynamic imports for all utils (they're TypeScript but Vercel handles them)
    const { scrapeWebsite } = await import('../../utils/scraper.ts');
    const { normalizeToBusinessConfig } = await import('../../utils/normalizer.ts');
    const { normalizeToPreviewLandingPageData } = await import('../../utils/previewNormalizer.ts');
    const { extractContactInfo } = await import('../../utils/contactExtractor.ts');
    const { captureScreenshot } = await import('../../utils/screenshotCapture.ts');
    
    console.log('[PIPELINE] All utils imported successfully');
    
    // Step 1: Scrape website
    console.log('[PIPELINE] Step 1: Scraping website...');
    const scrapeResult = await scrapeWebsite(url, firecrawlApiKey);
    console.log('[PIPELINE] Scraping complete, markdown length:', scrapeResult.markdown?.length);
    
    // Step 2: Normalize to BusinessConfig
    console.log('[PIPELINE] Step 2: Normalizing to BusinessConfig...');
    const config = await normalizeToBusinessConfig(
      scrapeResult.markdown,
      businessId,
      domain,
      geminiApiKey
    );
    console.log('[PIPELINE] Config generated, business name:', config.name);
    
    // Step 3: Normalize to PreviewLandingPageData
    console.log('[PIPELINE] Step 3: Normalizing to PreviewLandingPageData...');
    const previewData = await normalizeToPreviewLandingPageData(
      scrapeResult.markdown,
      scrapeResult.images,
      scrapeResult.links,
      scrapeResult.metadata,
      config.name,
      geminiApiKey
    );
    console.log('[PIPELINE] Preview data generated');
    
    // Step 4: Extract contact information
    console.log('[PIPELINE] Step 4: Extracting contact info...');
    const contactInfo = extractContactInfo(scrapeResult);
    console.log('[PIPELINE] Contact info extracted');
    
    // Step 5: Capture screenshot
    let screenshotUrl;
    try {
      const websiteUrl = url.startsWith('http') ? url : `https://${url}`;
      const useSupabaseStorage = !!process.env.VERCEL;
      console.log('[PIPELINE] Step 5: Capturing screenshot...', { websiteUrl, useSupabaseStorage });
      screenshotUrl = await captureScreenshot(websiteUrl, businessId, useSupabaseStorage) || undefined;
      console.log('[PIPELINE] Screenshot captured, URL:', screenshotUrl || 'null');
    } catch (screenshotError) {
      console.error('[PIPELINE] Screenshot capture failed:', screenshotError);
      // Continue without screenshot - it's optional
    }
    
    console.log('[PIPELINE] Pipeline complete');
    return { config, previewData, contactInfo, screenshotUrl };
  } catch (error) {
    console.error('[PIPELINE] Pipeline error:', error);
    return { error: error.message };
  }
}

