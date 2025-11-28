import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    const { data, error } = await client
      .from('businesses')
      .select('config_json')
      .eq('id', businessId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Business not found' });
    }

    return res.status(200).json(data.config_json);
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Failed to load business config' });
  }
}

