import { chromium } from 'playwright';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

/**
 * Captures a full-page screenshot of a website using Playwright
 * @param url - The website URL to screenshot
 * @param businessId - The business ID to use as the filename
 * @param useSupabaseStorage - If true, upload to Supabase Storage instead of local filesystem
 * @returns The public URL path to the saved screenshot, or null if failed
 */
export async function captureScreenshot(
  url: string, 
  businessId: string,
  useSupabaseStorage: boolean = false
): Promise<string | null> {
  let browser = null;
  
  try {
    // Ensure the URL has a protocol
    const websiteUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // Launch browser
    browser = await chromium.launch({
      headless: true,
    });
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    
    const page = await context.newPage();
    
    // Navigate to the page and wait for it to load
    await page.goto(websiteUrl, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    
    // Wait a bit more for any lazy-loaded content
    await page.waitForTimeout(2000);
    
    // Take a full-page screenshot
    const screenshotBuffer = await page.screenshot({
      fullPage: true,
      type: 'png',
    });
    
    if (useSupabaseStorage) {
      // Upload to Supabase Storage (for Vercel deployment)
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase credentials not configured for storage upload');
        return null;
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      const fileName = `${businessId}.png`;
      const filePath = `screenshots/${fileName}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('screenshots')
        .upload(filePath, screenshotBuffer, {
          contentType: 'image/png',
          upsert: true,
        });
      
      if (error) {
        console.error('Failed to upload screenshot to Supabase Storage:', error);
        return null;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(filePath);
      
      return urlData?.publicUrl || null;
    } else {
      // Save to local filesystem (for local development)
      const screenshotDir = join(process.cwd(), 'public', 'screenshots');
      if (!existsSync(screenshotDir)) {
        mkdirSync(screenshotDir, { recursive: true });
      }
      
      const screenshotPath = join(screenshotDir, `${businessId}.png`);
      writeFileSync(screenshotPath, screenshotBuffer);
      
      return `/screenshots/${businessId}.png`;
    }
  } catch (error: any) {
    console.error('Failed to capture screenshot with Playwright:', error);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

