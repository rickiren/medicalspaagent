import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from '../_lib/supabase';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const supabase = getSupabaseClient();

    if (req.method === 'GET') {
      // List all businesses
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('id, name, domain, created_at, updated_at')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        res.status(200).json(data || []);
      } catch (error: any) {
        console.error('Error loading businesses:', error);
        res.status(500).json({ 
          error: 'Failed to load businesses',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    } else if (req.method === 'POST') {
      // Create or update a business
      try {
        const payload = req.body;
        
        const { data, error } = await supabase
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
          throw error;
        }

        res.status(200).json(data);
      } catch (error: any) {
        console.error('Error saving business:', error);
        res.status(400).json({ error: error.message || 'Failed to save business' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}

