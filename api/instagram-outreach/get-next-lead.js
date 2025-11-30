import { getSupabaseClient } from '../_lib/supabase.js';

/**
 * GET /api/instagram-outreach/get-next-lead
 * Returns the next pending lead for Instagram outreach
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabaseClient();

    // Get the next pending lead, ordered by created_at ASC
    const { data, error } = await supabase
      .from('leads')
      .select('id, instagram_handle, personalized_message')
      .eq('outreach_status', 'pending')
      .not('instagram_handle', 'is', null)
      .not('personalized_message', 'is', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error) {
      // If no rows found, that's okay - just return null
      if (error.code === 'PGRST116') {
        return res.status(200).json({ lead: null });
      }
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ lead: data });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

