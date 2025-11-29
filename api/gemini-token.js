/**
 * API Endpoint: Get Gemini Access Token
 * 
 * GET /api/gemini-token
 * 
 * Returns an access token for Gemini API using service account credentials.
 * This allows client-side code to use service account auth instead of API keys.
 * 
 * Response:
 * {
 *   "token": "ya29.xxx...",
 *   "expiresIn": 3600
 * }
 */

import { getGeminiAccessToken, isServiceAccountConfigured } from '../utils/geminiAuth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!isServiceAccountConfigured()) {
      return res.status(500).json({ 
        error: 'Service account not configured',
        message: 'GOOGLE_APPLICATION_CREDENTIALS environment variable not set'
      });
    }

    const token = await getGeminiAccessToken();
    
    // Tokens typically expire in 1 hour
    return res.status(200).json({
      token,
      expiresIn: 3600
    });
  } catch (error) {
    console.error('[GEMINI-TOKEN] Error getting access token:', error);
    return res.status(500).json({
      error: 'Failed to get access token',
      message: error.message
    });
  }
}

