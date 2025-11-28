import { chromium } from 'playwright';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

export async function captureScreenshot(url, businessId, useSupabaseStorage = false) {
  console.log('[SCREENSHOT] Starting capture:', { url, businessId, useSupabaseStorage });
  let browser = null;
  
  try {
    const websiteUrl = url.startsWith('http') ? url : `https://${url}`;
    console.log('[SCREENSHOT] Website URL:', websiteUrl);
    
    console.log('[SCREENSHOT] Launching browser...');
    browser = await chromium.launch({
      headless: true,
    });
    console.log('[SCREENSHOT] Browser launched');
    
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    
    const page = await context.newPage();
    
    console.log('[SCREENSHOT] Navigating to page...');
    await page.goto(websiteUrl, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    console.log('[SCREENSHOT] Page loaded');
    
    await page.waitForTimeout(2000);
    
    console.log('[SCREENSHOT] Taking screenshot...');
    const screenshotBuffer = await page.screenshot({
      fullPage: true,
      type: 'png',
    });
    console.log('[SCREENSHOT] Screenshot captured, size:', screenshotBuffer.length, 'bytes');
    
    if (useSupabaseStorage) {
      console.log('[SCREENSHOT] Uploading to Supabase Storage...');
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
      
      console.log('[SCREENSHOT] Supabase config:', {
        hasUrl: !!supabaseUrl,
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
        usingKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon'
      });
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('[SCREENSHOT] Supabase credentials not configured for storage upload');
        return null;
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      const fileName = `${businessId}.png`;
      const filePath = `screenshots/${fileName}`;
      
      console.log('[SCREENSHOT] Uploading to path:', filePath);
      const { data, error } = await supabase.storage
        .from('screenshots')
        .upload(filePath, screenshotBuffer, {
          contentType: 'image/png',
          upsert: true,
        });
      
      if (error) {
        console.error('[SCREENSHOT] Failed to upload screenshot to Supabase Storage:', error);
        console.error('[SCREENSHOT] Error details:', JSON.stringify(error, null, 2));
        return null;
      }
      
      console.log('[SCREENSHOT] Upload successful, data:', data);
      
      const { data: urlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(filePath);
      
      console.log('[SCREENSHOT] Public URL:', urlData?.publicUrl);
      return urlData?.publicUrl || null;
    } else {
      console.log('[SCREENSHOT] Saving to local filesystem...');
      const screenshotDir = join(process.cwd(), 'public', 'screenshots');
      if (!existsSync(screenshotDir)) {
        mkdirSync(screenshotDir, { recursive: true });
      }
      
      const screenshotPath = join(screenshotDir, `${businessId}.png`);
      writeFileSync(screenshotPath, screenshotBuffer);
      console.log('[SCREENSHOT] Saved to:', screenshotPath);
      
      return `/screenshots/${businessId}.png`;
    }
  } catch (error) {
    console.error('[SCREENSHOT] Failed to capture screenshot with Playwright:', error);
    console.error('[SCREENSHOT] Error message:', error.message);
    console.error('[SCREENSHOT] Error stack:', error.stack);
    return null;
  } finally {
    if (browser) {
      console.log('[SCREENSHOT] Closing browser...');
      await browser.close();
    }
  }
}

