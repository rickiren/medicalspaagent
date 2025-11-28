import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from '../_lib/supabase';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const supabase = getSupabaseClient();
  const { id } = req.query;
  const businessId = Array.isArray(id) ? id[0] : id;

  if (!businessId) {
    res.status(400).json({ error: 'Business ID is required' });
    return;
  }

  if (req.method === 'GET') {
    // Get single business
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, domain, config_json, preview_data_json, contact_info_json, preview_screenshot_url, created_at, updated_at')
        .eq('id', businessId)
        .single();

      if (error || !data) {
        res.status(404).json({ error: 'Business not found' });
        return;
      }

      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to load business' });
    }
  } else if (req.method === 'PUT') {
    // Update business
    try {
      const payload = req.body;
      const { data, error } = await supabase
        .from('businesses')
        .update({
          name: payload.name,
          domain: payload.domain,
          config_json: payload.config_json,
          preview_data_json: payload.preview_data_json || null,
          contact_info_json: payload.contact_info_json || null,
        })
        .eq('id', businessId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        res.status(404).json({ error: 'Business not found' });
        return;
      }

      res.status(200).json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to update business' });
    }
  } else if (req.method === 'DELETE') {
    // Delete business
    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessId);

      if (error) {
        throw error;
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete business' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

