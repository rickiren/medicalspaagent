import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase credentials not configured' });
    }

    const client = createClient(supabaseUrl, supabaseKey);
    const { id } = req.query;
    const businessId = Array.isArray(id) ? id[0] : id;

    if (!businessId) {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    if (req.method === 'GET') {
      const { data, error } = await client
        .from('businesses')
        .select('id, name, domain, config_json, preview_data_json, contact_info_json, preview_screenshot_url, created_at, updated_at')
        .eq('id', businessId)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Business not found' });
      }

      return res.status(200).json(data);
    } else if (req.method === 'PUT') {
      const payload = req.body;
      const { data, error } = await client
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
        return res.status(400).json({ error: error.message });
      }

      if (!data) {
        return res.status(404).json({ error: 'Business not found' });
      }

      return res.status(200).json(data);
    } else if (req.method === 'DELETE') {
      const { error } = await client
        .from('businesses')
        .delete()
        .eq('id', businessId);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ success: true });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

