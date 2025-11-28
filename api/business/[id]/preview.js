import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[PREVIEW-API] Request received:', req.query);
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[PREVIEW-API] Supabase credentials not configured');
      return res.status(500).json({ error: 'Supabase credentials not configured' });
    }

    const client = createClient(supabaseUrl, supabaseKey);
    const { id } = req.query;
    const businessId = Array.isArray(id) ? id[0] : id;

    console.log('[PREVIEW-API] Business ID:', businessId);

    if (!businessId) {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    console.log('[PREVIEW-API] Fetching business from database...');
    const { data, error } = await client
      .from('businesses')
      .select('id, name, domain, preview_screenshot_url, preview_data_json')
      .eq('id', businessId)
      .single();

    if (error) {
      console.error('[PREVIEW-API] Database error:', error);
      return res.status(404).json({ error: 'Business not found', details: error.message });
    }

    if (!data) {
      console.error('[PREVIEW-API] No data returned for business:', businessId);
      return res.status(404).json({ error: 'Business not found' });
    }

    console.log('[PREVIEW-API] Business found:', {
      id: data.id,
      name: data.name,
      hasScreenshotUrl: !!data.preview_screenshot_url,
      screenshotUrl: data.preview_screenshot_url,
      hasPreviewData: !!data.preview_data_json
    });

    // Return exactly what the preview page expects
    const response = {
      businessId: data.id,
      businessName: data.name,
      domain: data.domain,
      screenshotUrl: data.preview_screenshot_url || null,
      previewData: data.preview_data_json || null
    };

    console.log('[PREVIEW-API] Returning response:', {
      ...response,
      screenshotUrl: response.screenshotUrl ? 'present' : 'null',
      previewData: response.previewData ? 'present' : 'null'
    });

    return res.status(200).json(response);
  } catch (err) {
    console.error('[PREVIEW-API] Unexpected error:', err);
    console.error('[PREVIEW-API] Error stack:', err.stack);
    return res.status(500).json({ 
      error: err.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}

