import { scrapeWebsite } from './scraper';
import { normalizeToBusinessConfig } from './normalizer';
import { normalizeToPreviewLandingPageData } from './previewNormalizer';
import { extractContactInfo, ContactInfo } from './contactExtractor';
import { captureScreenshot } from './screenshotCapture';
import { BusinessConfig, PreviewLandingPageData } from '../types';

// Enhanced pipeline runner that generates widget config, preview data, contact info, and screenshot
export async function runScrapingPipeline(params: {
  url: string;
  businessId: string;
  domain: string;
  firecrawlApiKey: string;
  geminiApiKey: string;
}): Promise<{ 
  config?: BusinessConfig; 
  previewData?: PreviewLandingPageData;
  contactInfo?: ContactInfo;
  screenshotUrl?: string;
  error?: string 
}> {
  try {
    // Step 1: Scrape website (single scrape with enhanced extraction)
    const scrapeResult = await scrapeWebsite(params.url, params.firecrawlApiKey);
    
    // Step 2: Normalize to BusinessConfig (for AI widget)
    const config = await normalizeToBusinessConfig(
      scrapeResult.markdown,
      params.businessId,
      params.domain,
      params.geminiApiKey
    );
    
    // Step 3: Normalize to PreviewLandingPageData (for preview page)
    const previewData = await normalizeToPreviewLandingPageData(
      scrapeResult.markdown,
      scrapeResult.images,
      scrapeResult.links,
      scrapeResult.metadata,
      config.name,
      params.geminiApiKey
    );
    
    // Step 4: Extract contact information (emails, phones, addresses, social, etc.)
    const contactInfo = extractContactInfo(scrapeResult);
    
    // Step 5: Capture screenshot using Playwright
    // Use Supabase Storage on Vercel, local filesystem otherwise
    let screenshotUrl: string | undefined;
    try {
      const websiteUrl = params.url.startsWith('http') ? params.url : `https://${params.url}`;
      const useSupabaseStorage = !!process.env.VERCEL; // Use storage on Vercel
      console.log('[PIPELINE] Starting screenshot capture:', {
        websiteUrl,
        businessId: params.businessId,
        useSupabaseStorage,
        isVercel: !!process.env.VERCEL
      });
      screenshotUrl = await captureScreenshot(websiteUrl, params.businessId, useSupabaseStorage) || undefined;
      console.log('[PIPELINE] Screenshot capture result:', { screenshotUrl: screenshotUrl || 'null' });
    } catch (screenshotError) {
      console.error('[PIPELINE] Screenshot capture failed:', screenshotError);
      console.error('[PIPELINE] Screenshot error details:', screenshotError.message);
      // Continue without screenshot - it's optional
    }
    
    return { config, previewData, contactInfo, screenshotUrl };
  } catch (error: any) {
    return { error: error.message };
  }
}

