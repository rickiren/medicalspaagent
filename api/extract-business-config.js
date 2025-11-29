/**
 * API Endpoint: Extract Business Config
 * 
 * POST /api/extract-business-config
 * 
 * Extracts structured BusinessConfig from stored raw HTML/text
 * using Gemini. This runs on already-stored data, so it's free.
 * 
 * Body:
 * {
 *   "leadId": "lead-id",        // optional, use with leads table
 *   "businessId": "business-id", // optional, use with businesses table
 *   "domain": "example.com"      // optional
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "config": { ... BusinessConfig ... }
 * }
 */

import { extractBusinessConfig } from './_lib/businessExtractor.js';

export default async function handler(req, res) {
  console.log('[EXTRACT-BUSINESS-CONFIG] Request received:', {
    method: req.method,
    hasBody: !!req.body,
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { leadId, businessId, domain } = req.body;

    if (!leadId && !businessId) {
      return res.status(400).json({ 
        error: 'Either leadId or businessId is required' 
      });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res.status(500).json({ 
        error: 'GEMINI_API_KEY not configured' 
      });
    }

    const idType = leadId ? 'lead' : 'business';
    const idValue = leadId || businessId;
    console.log('[EXTRACT-BUSINESS-CONFIG] Starting extraction:', { [idType + 'Id']: idValue, domain });

    // Extract config from stored raw data
    const config = await extractBusinessConfig({ leadId, businessId, domain, geminiApiKey });
    console.log('[EXTRACT-BUSINESS-CONFIG] Extraction complete:', {
      businessName: config.name,
      servicesCount: config.services?.length || 0,
      locationsCount: config.locations?.length || 0,
    });

    return res.status(200).json({
      success: true,
      config,
    });
  } catch (error) {
    console.error('[EXTRACT-BUSINESS-CONFIG] Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to extract business config' 
    });
  }
}

