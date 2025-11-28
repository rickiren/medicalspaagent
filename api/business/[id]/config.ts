import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from '../../_lib/supabase';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { id } = req.query;
  const businessId = Array.isArray(id) ? id[0] : id;

  if (!businessId) {
    res.status(400).json({ error: 'Business ID is required' });
    return;
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('businesses')
      .select('config_json')
      .eq('id', businessId)
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Business not found' });
      return;
    }

    res.status(200).json(data.config_json);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to load business config' });
  }
}

