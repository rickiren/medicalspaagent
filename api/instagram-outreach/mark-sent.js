import { getSupabaseClient } from '../_lib/supabase.js';

/**
 * POST /api/instagram-outreach/mark-sent
 * Marks a lead as sent (or failed) after Instagram outreach attempt
 * Body: { id: string, status?: 'sent' | 'failed' }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, status = 'sent' } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Missing required field: id' });
    }

    if (status !== 'sent' && status !== 'failed') {
      return res.status(400).json({ error: 'Status must be "sent" or "failed"' });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('leads')
      .update({ outreach_status: status })
      .eq('id', id)
      .select('id')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

