/**
 * Firecrawl Storage Service
 * 
 * Stores raw HTML and text from Firecrawl crawls in Supabase.
 * This allows unlimited extraction without re-crawling.
 */

import { getSupabaseClient } from './supabase.js';

/**
 * Store raw crawl data in Supabase
 * 
 * @param {Object} options - Options object
 * @param {string} options.leadId - Lead ID (TEXT, matches leads table) - optional
 * @param {string} options.businessId - Business ID (TEXT, matches businesses table) - optional
 * @param {Object} options.crawlData - Crawl result from firecrawlCrawler
 * @returns {Promise<Object>} Stored record
 */
export async function storeRawCrawlData({ leadId, businessId, crawlData }) {
  if (!crawlData) {
    throw new Error('crawlData is required');
  }

  if (!leadId && !businessId) {
    throw new Error('Either leadId or businessId is required');
  }

  const supabase = getSupabaseClient();

  try {
    const idType = leadId ? 'lead' : 'business';
    const idValue = leadId || businessId;
    console.log(`[FIRECRAWL-STORAGE] Storing raw crawl data for ${idType}:`, idValue);
    console.log('[FIRECRAWL-STORAGE] Data sizes:', {
      rawHtml: crawlData.rawHtml?.length || 0,
      rawText: crawlData.rawText?.length || 0,
      pagesCount: crawlData.pages?.length || 0,
    });

    // Check if record already exists
    let existing;
    if (leadId) {
      const { data } = await supabase
        .from('firecrawl_raw')
        .select('id')
        .eq('lead_id', leadId)
        .maybeSingle();
      existing = data;
    } else {
      const { data } = await supabase
        .from('firecrawl_raw')
        .select('id')
        .eq('business_id', businessId)
        .maybeSingle();
      existing = data;
    }

    const record = {
      lead_id: leadId || null,
      business_id: businessId || null,
      raw_html: crawlData.rawHtml || null,
      raw_text: crawlData.rawText || null,
      pages: crawlData.pages || [],
      metadata: crawlData.metadata || {},
    };

    let result;
    if (existing) {
      // Update existing record
      console.log('[FIRECRAWL-STORAGE] Updating existing record:', existing.id);
      const { data, error } = await supabase
        .from('firecrawl_raw')
        .update(record)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new record
      console.log('[FIRECRAWL-STORAGE] Creating new record');
      const { data, error } = await supabase
        .from('firecrawl_raw')
        .insert(record)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    console.log('[FIRECRAWL-STORAGE] Successfully stored raw crawl data');
    return result;
  } catch (error) {
    console.error('[FIRECRAWL-STORAGE] Storage failed:', error);
    throw new Error(`Failed to store raw crawl data: ${error.message}`);
  }
}

/**
 * Retrieve raw crawl data from Supabase
 * 
 * @param {Object} options - Options object
 * @param {string} options.leadId - Lead ID (optional)
 * @param {string} options.businessId - Business ID (optional)
 * @returns {Promise<Object|null>} Stored crawl data or null if not found
 */
export async function getRawCrawlData({ leadId, businessId }) {
  if (!leadId && !businessId) {
    throw new Error('Either leadId or businessId is required');
  }

  const supabase = getSupabaseClient();

  try {
    let query = supabase.from('firecrawl_raw').select('*');
    
    if (leadId) {
      query = query.eq('lead_id', leadId);
    } else {
      query = query.eq('business_id', businessId);
    }
    
    const { data, error } = await query.maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[FIRECRAWL-STORAGE] Retrieval failed:', error);
    throw new Error(`Failed to retrieve raw crawl data: ${error.message}`);
  }
}

/**
 * Check if raw crawl data exists
 * 
 * @param {Object} options - Options object
 * @param {string} options.leadId - Lead ID (optional)
 * @param {string} options.businessId - Business ID (optional)
 * @returns {Promise<boolean>} True if data exists
 */
export async function hasRawCrawlData({ leadId, businessId }) {
  if (!leadId && !businessId) {
    return false;
  }

  try {
    const data = await getRawCrawlData({ leadId, businessId });
    return !!data && (!!data.raw_html || !!data.raw_text);
  } catch (error) {
    console.error('[FIRECRAWL-STORAGE] Check failed:', error);
    return false;
  }
}

