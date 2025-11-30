const functions = require('firebase-functions/v2');
const { WebSocketServer } = require('ws');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');

// Reuse a single WebSocketServer instance for all upgrades
const wss = new WebSocketServer({ noServer: true });

// Load .env file for local development (when running in emulator or locally)
if (!process.env.OPENAI_API_KEY || process.env.FUNCTIONS_EMULATOR === 'true' || process.env.NODE_ENV !== 'production') {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const match = trimmed.match(/^([^=:#]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, '');
          if (key && !process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    });
    console.log('[OPENAI-PROXY] ✅ Loaded environment variables from .env file');
  }
}

/**
 * Cloud Function (2nd gen) to proxy WebSocket connections to OpenAI Realtime API
 * This is necessary because browsers cannot send Authorization headers with WebSocket connections
 * 
 * Cloud Functions 2nd gen run on Cloud Run which supports WebSocket connections
 * We need to handle WebSocket upgrades at the HTTP server level, not through Express
 */
exports.openaiRealtimeProxy = functions.https.onRequest({
  secrets: ['OPENAI_API_KEY', 'OPENAI_PROJECT_ID'],
  timeoutSeconds: 3600, // 1 hour for long-lived WebSocket connections
  memory: '512MiB',
  minInstances: 0,
  maxInstances: 10,
  concurrency: 80
}, async (req, res) => {
  console.log('[OPENAI-PROXY] 📥 Request received', {
    method: req.method,
    upgrade: req.headers.upgrade,
    connection: req.headers.connection,
    url: req.url
  });

  // Handle CORS/preflight for the POST session bootstrap
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).send('');
  }

  // Allow the frontend to fetch a client_id before upgrading to WebSocket
  if (req.method === 'POST' && req.headers.upgrade !== 'websocket') {
    const clientId = randomUUID();
    res.set('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ client_id: clientId });
  }

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

  // For Firebase Functions emulator, we need to handle WebSocket upgrades differently
  // The emulator doesn't expose the raw HTTP server, so we need to use a workaround
  
  // Check if we can access the socket
  const socket = req.socket || req.connection;
  
  if (!socket || !socket.readable) {
    console.error('[OPENAI-PROXY] ❌ No valid socket available for WebSocket upgrade', {
      hasSocket: !!socket,
      socketReadable: socket?.readable
    });
    return res.status(500).json({ 
      error: 'WebSocket upgrade failed',
      message: 'Unable to access connection socket'
    });
  }

  // Create WebSocket server for handling upgrades
  const wss = new WebSocketServer({ noServer: true });

  // CRITICAL: Don't send any HTTP response - we're upgrading to WebSocket
  // The upgrade response will be sent by handleUpgrade

  try {
    // For Firebase Functions, we need to pass the request as-is
    // The handleUpgrade method will handle the upgrade protocol
    const head = Buffer.alloc(0);
    
    // IMPORTANT: In Firebase Functions emulator, we need to ensure the request
    // is in the right state for upgrade. The req object from Firebase Functions
    // should work, but we need to make sure we're not interfering with it.
    
    console.log('[OPENAI-PROXY] 🔄 Attempting WebSocket upgrade...', {
      upgrade: req.headers.upgrade,
      connection: req.headers.connection,
      secWebSocketKey: req.headers['sec-websocket-key'],
      socketReadable: socket.readable,
      socketWritable: socket.writable
    });
    
    // CRITICAL: handleUpgrade will send the HTTP 101 Switching Protocols response
    // We must NOT send any response before this, and we must NOT return from this function
    // until the upgrade is complete (or fails)
    
    console.log('[OPENAI-PROXY] 🔧 Calling wss.handleUpgrade...');
    wss.handleUpgrade(req, socket, head, (clientWs) => {
      let clientId = null;
      try {
        clientId = new URL(req.url || '/', 'http://localhost').searchParams.get('client_id');
      } catch (e) {
        // ignore URL parse issues
      }

      console.log('[OPENAI-PROXY] ✅ Client WebSocket upgrade completed - callback executed', {
        readyState: clientWs.readyState,
        timestamp: new Date().toISOString(),
        url: clientWs.url,
        protocol: clientWs.protocol,
        clientId: clientId || 'none'
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

      // Connect to OpenAI with Authorization headers IMMEDIATELY
      const openaiWs = new WebSocket(openaiUrl, {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          ...(openaiProjectId && { 'OpenAI-Project': openaiProjectId }),
          'OpenAI-Beta': 'realtime=v1'
        }
      });

      openaiWs.on('open', () => {
        console.log('[OPENAI-PROXY] ✅ Connected to OpenAI - ready to forward messages');
      });

      openaiWs.on('error', (error) => {
        console.error('[OPENAI-PROXY] ❌ OpenAI connection error:', error);
      });

      let isClosing = false;

      // Forward messages from browser to OpenAI
      clientWs.on('message', (data) => {
        console.log('[OPENAI-PROXY] 📨 Received message from client, forwarding to OpenAI');
        if (!isClosing && openaiWs.readyState === WebSocket.OPEN) {
          try {
            openaiWs.send(data);
          } catch (error) {
            console.error('[OPENAI-PROXY] ❌ Error forwarding client message:', error);
          }
        } else {
          console.warn('[OPENAI-PROXY] ⚠️ Cannot forward message - OpenAI not ready', {
            isClosing,
            openaiReadyState: openaiWs.readyState
          });
        }
      });

      // Forward messages from OpenAI to browser
      openaiWs.on('message', (data) => {
        console.log('[OPENAI-PROXY] 📨 Received message from OpenAI, forwarding to client');
        if (!isClosing && clientWs.readyState === WebSocket.OPEN) {
          try {
            clientWs.send(data);
          } catch (error) {
            console.error('[OPENAI-PROXY] ❌ Error forwarding OpenAI message:', error);
          }
        } else {
          console.warn('[OPENAI-PROXY] ⚠️ Cannot forward message - client not ready', {
            isClosing,
            clientReadyState: clientWs.readyState
          });
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
    }); // closes handleUpgrade callback and method call
  } catch (error) {
    console.error('[OPENAI-PROXY] ❌ Error handling WebSocket upgrade:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'WebSocket upgrade failed',
        message: error.message 
      });
    }
  }
});
