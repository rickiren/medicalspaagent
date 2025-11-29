const functions = require('firebase-functions/v2');
const { WebSocketServer } = require('ws');
const WebSocket = require('ws');
const http = require('http');

/**
 * Cloud Function (2nd gen) to proxy WebSocket connections to OpenAI Realtime API
 * This is necessary because browsers cannot send Authorization headers with WebSocket connections
 * 
 * Cloud Functions 2nd gen run on Cloud Run which supports WebSocket connections
 * We need to handle WebSocket upgrades at the HTTP server level, not through Express
 */
exports.openaiRealtimeProxy = functions.runWith({
  secrets: ['OPENAI_API_KEY', 'OPENAI_PROJECT_ID'],
  timeoutSeconds: 3600, // 1 hour for long-lived WebSocket connections
  memory: '512MiB',
  minInstances: 0,
  maxInstances: 10,
  concurrency: 80
}).https.onRequest((req, res) => {
  // Check if this is a WebSocket upgrade request
  if (req.headers.upgrade !== 'websocket') {
    return res.status(400).json({ 
      error: 'This endpoint only accepts WebSocket connections',
      message: 'Use WebSocket protocol to connect'
    });
  }

  // Get OpenAI credentials from secrets
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const openaiProjectId = process.env.OPENAI_PROJECT_ID;

  if (!openaiApiKey) {
    console.error('[OPENAI-PROXY] ❌ No OpenAI API key found in secrets');
    return res.status(500).json({ 
      error: 'OpenAI API key not configured',
      message: 'Please set OPENAI_API_KEY secret in Firebase'
    });
  }

  // Create WebSocket server for handling upgrades
  const wss = new WebSocketServer({ noServer: true });

  // For Cloud Run, we need to handle the upgrade on the request's socket
  // The req object should have access to the underlying socket
  const socket = req.socket;
  const head = Buffer.alloc(0);

  // Handle the upgrade
  wss.handleUpgrade(req, socket, head, (clientWs) => {
    console.log('[OPENAI-PROXY] ✅ Client connected to proxy', {
      readyState: clientWs.readyState,
      timestamp: new Date().toISOString()
    });

    // Build OpenAI WebSocket URL
    let openaiUrl = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17';
    if (openaiProjectId) {
      openaiUrl += `&project_id=${encodeURIComponent(openaiProjectId)}`;
    }

    console.log('[OPENAI-PROXY] 🔌 Connecting to OpenAI...', {
      url: openaiUrl.replace(openaiApiKey, '[REDACTED]'),
      hasProjectId: !!openaiProjectId
    });

    // Connect to OpenAI with Authorization headers
    const openaiWs = new WebSocket(openaiUrl, {
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        ...(openaiProjectId && { 'OpenAI-Project': openaiProjectId })
      }
    });

    openaiWs.on('open', () => {
      console.log('[OPENAI-PROXY] ✅ Connected to OpenAI');
    });

    let isClosing = false;

    // Forward messages from browser to OpenAI
    clientWs.on('message', (data) => {
      if (!isClosing && openaiWs.readyState === WebSocket.OPEN) {
        try {
          openaiWs.send(data);
        } catch (error) {
          console.error('[OPENAI-PROXY] ❌ Error forwarding client message:', error);
        }
      }
    });

    // Forward messages from OpenAI to browser
    openaiWs.on('message', (data) => {
      if (!isClosing && clientWs.readyState === WebSocket.OPEN) {
        try {
          clientWs.send(data);
        } catch (error) {
          console.error('[OPENAI-PROXY] ❌ Error forwarding OpenAI message:', error);
        }
      }
    });

    // Handle errors
    openaiWs.on('error', (error) => {
      console.error('[OPENAI-PROXY] ❌ OpenAI WebSocket error:', error);
      if (!isClosing) {
        isClosing = true;
        try {
          clientWs.close(1011, 'OpenAI connection error');
        } catch (e) {
          // Ignore errors during close
        }
      }
    });

    clientWs.on('error', (error) => {
      console.error('[OPENAI-PROXY] ❌ Client WebSocket error:', error);
    });

    // Handle close events - prevent infinite loops
    openaiWs.on('close', (code, reason) => {
      console.log('[OPENAI-PROXY] 🔌 OpenAI closed:', { 
        code, 
        reason: reason.toString() 
      });
      if (!isClosing && clientWs.readyState === WebSocket.OPEN) {
        isClosing = true;
        try {
          clientWs.close(code, reason);
        } catch (e) {
          // Ignore errors during close
        }
      }
    });

    clientWs.on('close', (code, reason) => {
      console.log('[OPENAI-PROXY] 🔌 Client closed:', { 
        code, 
        reason: reason.toString() 
      });
      if (!isClosing && openaiWs.readyState === WebSocket.OPEN) {
        isClosing = true;
        try {
          openaiWs.close();
        } catch (e) {
          // Ignore errors during close
        }
      }
    });
  });
});

