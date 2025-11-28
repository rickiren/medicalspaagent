import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ 
        error: 'Supabase credentials not configured',
        message: 'Missing SUPABASE_URL or SUPABASE_ANON_KEY'
      });
    }

    const client = createClient(supabaseUrl, supabaseKey);

    if (req.method === 'GET') {
      const { data, error } = await client
        .from('businesses')
        .select('id, name, domain, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data || []);
    } else if (req.method === 'POST') {
      const payload = req.body;
      
      const { data, error } = await client
        .from('businesses')
        .upsert({
          id: payload.id,
          name: payload.name,
          domain: payload.domain,
          config_json: payload.config_json,
          preview_data_json: payload.preview_data_json || null,
          contact_info_json: payload.contact_info_json || null,
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json(data);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

