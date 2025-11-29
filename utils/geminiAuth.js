import { GoogleAuth } from 'google-auth-library';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let authClient = null;

/**
 * Initialize Google Auth client using service account credentials
 */
export function initializeGeminiAuth() {
  if (authClient) {
    return authClient;
  }

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (!credentialsPath) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable not set');
  }

  // Resolve the path (handle relative paths)
  const resolvedPath = credentialsPath.startsWith('/') 
    ? credentialsPath 
    : resolve(process.cwd(), credentialsPath);

  try {
    // Read and parse the service account JSON
    const credentials = JSON.parse(readFileSync(resolvedPath, 'utf-8'));
    
    authClient = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/generative-language'],
    });

    return authClient;
  } catch (error) {
    throw new Error(`Failed to initialize Google Auth: ${error.message}`);
  }
}

/**
 * Get an access token for Gemini API using service account
 */
export async function getGeminiAccessToken() {
  const auth = initializeGeminiAuth();
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  
  if (!accessToken.token) {
    throw new Error('Failed to get access token from service account');
  }
  
  return accessToken.token;
}

/**
 * Check if service account authentication is configured
 */
export function isServiceAccountConfigured() {
  return !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
}

