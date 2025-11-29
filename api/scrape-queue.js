/**
 * API Endpoint: Scrape Queue
 * 
 * GET /api/scrape-queue - Get all queue items
 * POST /api/scrape-queue - Add item to queue
 * DELETE /api/scrape-queue/:id - Remove item from queue
 * POST /api/scrape-queue/process - Process next item in queue
 */

import { createClient } from '@supabase/supabase-js';

// In-memory queue (in production, you might want to use a database table)
let scrapeQueue = [];

export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ 
        error: 'Supabase credentials not configured'
      });
    }

    const client = createClient(supabaseUrl, supabaseKey);

    if (req.method === 'GET') {
      // Return all queue items
      return res.status(200).json({
        queue: scrapeQueue,
        total: scrapeQueue.length,
        pending: scrapeQueue.filter(item => item.status === 'pending').length,
        processing: scrapeQueue.filter(item => item.status === 'processing').length,
        completed: scrapeQueue.filter(item => item.status === 'completed').length,
        failed: scrapeQueue.filter(item => item.status === 'failed').length,
      });
    } else if (req.method === 'POST') {
      const { action, leadId, url } = req.body;

      if (action === 'add') {
        // Add item to queue
        if (!leadId || !url) {
          return res.status(400).json({ error: 'leadId and url are required' });
        }

        // Check if already in queue
        const existing = scrapeQueue.find(item => item.leadId === leadId && item.status !== 'completed' && item.status !== 'failed');
        if (existing) {
          return res.status(400).json({ error: 'Lead already in queue' });
        }

        const queueItem = {
          id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          leadId,
          url,
          status: 'pending',
          createdAt: new Date().toISOString(),
          startedAt: null,
          completedAt: null,
          error: null,
        };

        scrapeQueue.push(queueItem);
        return res.status(200).json({ success: true, item: queueItem });
      } else if (action === 'process') {
        // Process next pending item
        const pendingItem = scrapeQueue.find(item => item.status === 'pending');
        if (!pendingItem) {
          return res.status(404).json({ error: 'No pending items in queue' });
        }

        // Mark as processing
        pendingItem.status = 'processing';
        pendingItem.startedAt = new Date().toISOString();

        // Trigger the scrape
        try {
          const scrapeResponse = await fetch(`${req.headers.origin || 'http://localhost:5173'}/api/scrape-full-site`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              leadId: pendingItem.leadId,
              url: pendingItem.url,
            }),
          });

          if (!scrapeResponse.ok) {
            const errorData = await scrapeResponse.json();
            throw new Error(errorData.error || 'Scrape failed');
          }

          const scrapeData = await scrapeResponse.json();
          pendingItem.status = 'completed';
          pendingItem.completedAt = new Date().toISOString();
          pendingItem.result = scrapeData;

          return res.status(200).json({ 
            success: true, 
            item: pendingItem,
            result: scrapeData,
          });
        } catch (error) {
          pendingItem.status = 'failed';
          pendingItem.completedAt = new Date().toISOString();
          pendingItem.error = error.message;
          return res.status(500).json({ 
            success: false,
            item: pendingItem,
            error: error.message,
          });
        }
      } else {
        return res.status(400).json({ error: 'Invalid action. Use "add" or "process"' });
      }
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      const queueId = Array.isArray(id) ? id[0] : id;

      if (!queueId) {
        return res.status(400).json({ error: 'Queue item ID is required' });
      }

      const index = scrapeQueue.findIndex(item => item.id === queueId);
      if (index === -1) {
        return res.status(404).json({ error: 'Queue item not found' });
      }

      scrapeQueue.splice(index, 1);
      return res.status(200).json({ success: true });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

