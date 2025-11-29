// API endpoint to update preview_url and widget_url for existing businesses
// This is useful if businesses were scraped before the URL generation was added
// Usage: POST to /api/update-preview-urls with { businessId } or empty body to update all

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { businessId } = req.body;
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase credentials not configured' });
    }

    const client = createClient(supabaseUrl, supabaseKey);

    // Get base URL
    const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.PUBLIC_APP_URL;
    const firebaseUrl = process.env.FIREBASE_HOSTING_URL || 'https://gen-lang-client-0046334557.web.app';
    const baseUrl = publicAppUrl || firebaseUrl;

    console.log('[UPDATE-URLS] Using base URL:', baseUrl);

    // Get businesses to update
    let query = client.from('businesses').select('id');
    
    if (businessId) {
      query = query.eq('id', businessId);
    } else {
      // Update all businesses missing URLs
      query = query.or('preview_url.is.null,widget_url.is.null');
    }

    const { data: businesses, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

    if (!businesses || businesses.length === 0) {
      return res.status(200).json({ 
        message: 'No businesses found to update',
        updated: 0 
      });
    }

    console.log(`[UPDATE-URLS] Found ${businesses.length} businesses to update`);

    // Update each business
    const updates = businesses.map(business => {
      const previewUrl = `${baseUrl}/preview/${business.id}`;
      const widgetUrl = `${baseUrl}/widget/${business.id}`;
      
      return client
        .from('businesses')
        .update({
          preview_url: previewUrl,
          widget_url: widgetUrl,
        })
        .eq('id', business.id);
    });

    const results = await Promise.all(updates);
    const errors = results.filter(r => r.error);
    const successCount = results.length - errors.length;

    if (errors.length > 0) {
      console.error('[UPDATE-URLS] Some updates failed:', errors);
    }

    return res.status(200).json({
      message: `Updated ${successCount} of ${businesses.length} businesses`,
      updated: successCount,
      failed: errors.length,
      baseUrl,
      businesses: businesses.map(b => ({
        id: b.id,
        preview_url: `${baseUrl}/preview/${b.id}`,
        widget_url: `${baseUrl}/widget/${b.id}`,
      })),
    });
  } catch (error) {
    console.error('[UPDATE-URLS] Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to update URLs',
    });
  }
}

