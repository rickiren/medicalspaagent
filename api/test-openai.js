/**
 * API Endpoint: Test OpenAI API Key
 * 
 * GET /api/test-openai
 * 
 * Tests if the OpenAI API key is valid by making a simple API call.
 * 
 * Response:
 * {
 *   "valid": true,
 *   "message": "API key is valid"
 * }
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

// Helper function to send response (works with both Next.js and Node.js response objects)
function sendResponse(res, statusCode, data) {
  if (typeof res.status === 'function') {
    // Next.js-style response
    return res.status(statusCode).json(data);
  } else {
    // Node.js-style response
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendResponse(res, 405, { error: 'Method not allowed' });
  }

  try {
    const openaiApiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    
    // Debug: Log all environment variables
    const allEnvKeys = Object.keys(process.env);
    const openaiKeys = allEnvKeys.filter(k => k.includes('OPENAI'));
    const viteKeys = allEnvKeys.filter(k => k.startsWith('VITE_'));
    
    console.log('[TEST-OPENAI] Environment check:', {
      hasKey: !!openaiApiKey,
      keyLength: openaiApiKey?.length || 0,
      keyPrefix: openaiApiKey ? openaiApiKey.substring(0, 10) + '...' : 'MISSING',
      hasOPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      hasVITE_OPENAI_API_KEY: !!process.env.VITE_OPENAI_API_KEY,
      allOpenAIKeys: openaiKeys,
      allViteKeys: viteKeys,
      totalEnvKeys: allEnvKeys.length
    });
    
    // Log all VITE_ keys
    console.log('[TEST-OPENAI] All VITE_ keys:', viteKeys.map(k => `${k}=${process.env[k] ? process.env[k].substring(0, 15) + '...' : 'undefined'}`));

    if (!openaiApiKey) {
      return sendResponse(res, 400, {
        valid: false,
        error: 'OPENAI_API_KEY not found in environment variables',
        message: 'Please add OPENAI_API_KEY or VITE_OPENAI_API_KEY to your .env.local file'
      });
    }

    // Test the API key by making a simple chat completion call
    const testResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: 'Say "API key is working" in one sentence.'
          }
        ],
        max_tokens: 20
      })
    });

    if (!testResponse.ok) {
      const errorData = await testResponse.json().catch(() => ({ error: { message: testResponse.statusText } }));
      console.error('[TEST-OPENAI] API test failed:', {
        status: testResponse.status,
        statusText: testResponse.statusText,
        error: errorData
      });
      
      return sendResponse(res, testResponse.status, {
        valid: false,
        error: `OpenAI API error: ${testResponse.status} ${testResponse.statusText}`,
        message: errorData.error?.message || 'API key test failed',
        details: errorData
      });
    }

    const data = await testResponse.json();
    const responseText = data.choices?.[0]?.message?.content || 'No response';
    
    console.log('[TEST-OPENAI] ✅ API key is valid!', {
      response: responseText
    });

    return sendResponse(res, 200, {
      valid: true,
      message: 'API key is valid and working',
      testResponse: responseText
    });
  } catch (error) {
    console.error('[TEST-OPENAI] Error testing API key:', error);
    return sendResponse(res, 500, {
      valid: false,
      error: 'Failed to test API key',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

