/**
 * Business Config Extraction Service
 * 
 * Extracts structured BusinessConfig from stored raw HTML/text using Gemini.
 * This runs on already-stored data, so it's free (no Firecrawl costs).
 */

import { getRawCrawlData } from './firecrawlStorage.js';
import { getSupabaseClient } from './supabase.js';
import { isServiceAccountConfigured, getGeminiAccessToken } from '../../utils/geminiAuth.js';

/**
 * Extract BusinessConfig from stored raw crawl data
 * 
 * @param {Object} options - Options object
 * @param {string} options.leadId - Lead ID (optional)
 * @param {string} options.businessId - Business ID (optional)
 * @param {string} options.domain - Business domain (optional, for context)
 * @param {string} options.geminiApiKey - Gemini API key
 * @returns {Promise<Object>} Extracted BusinessConfig
 */
export async function extractBusinessConfig({ leadId, businessId, domain, geminiApiKey }) {
  const useServiceAccount = isServiceAccountConfigured();
  if (!useServiceAccount && !geminiApiKey) {
    throw new Error('Either geminiApiKey or GOOGLE_APPLICATION_CREDENTIALS must be provided');
  }

  if (!leadId && !businessId) {
    throw new Error('Either leadId or businessId is required');
  }

  try {
    const idType = leadId ? 'lead' : 'business';
    const idValue = leadId || businessId;
    console.log(`[BUSINESS-EXTRACTOR] Starting extraction for ${idType}:`, idValue);

    // Load raw data from Supabase
    const rawData = await getRawCrawlData({ leadId, businessId });
    
    if (!rawData) {
      throw new Error(`No raw crawl data found for ${idType}: ${idValue}. Run scrapeFullSite first.`);
    }

    if (!rawData.raw_text && !rawData.raw_html) {
      throw new Error(`Raw crawl data is empty for ${idType}: ${idValue}`);
    }

    console.log('[BUSINESS-EXTRACTOR] Raw data loaded:', {
      hasRawText: !!rawData.raw_text,
      hasRawHtml: !!rawData.raw_html,
      pagesCount: rawData.pages?.length || 0,
    });

    // Use raw_text as primary input (better for LLMs)
    // Fall back to extracting text from HTML if needed
    let inputText = rawData.raw_text || '';
    
    // If we have pages, combine their text
    if (rawData.pages && Array.isArray(rawData.pages) && rawData.pages.length > 0) {
      const pagesText = rawData.pages
        .map(page => page.rawText || page.raw_text || '')
        .filter(Boolean)
        .join('\n\n---\n\n');
      
      if (pagesText) {
        inputText = inputText ? `${inputText}\n\n---\n\n${pagesText}` : pagesText;
      }
    }

    if (!inputText || inputText.trim().length === 0) {
      throw new Error('No extractable text found in raw crawl data');
    }

    // Truncate to reasonable size for Gemini (keep first 100k chars)
    const maxLength = 100000;
    if (inputText.length > maxLength) {
      console.warn(`[BUSINESS-EXTRACTOR] Input text too long (${inputText.length}), truncating to ${maxLength} chars`);
      inputText = inputText.substring(0, maxLength);
    }

    // Generate extraction prompt
    const prompt = generateExtractionPrompt(idValue, domain, inputText);

    // Call Gemini API
    console.log('[BUSINESS-EXTRACTOR] Calling Gemini API...');
    const config = await callGeminiAPI(prompt, geminiApiKey);

    // Store extracted config
    console.log('[BUSINESS-EXTRACTOR] Storing extracted config...');
    await storeBusinessConfig({ leadId, businessId, config });

    console.log('[BUSINESS-EXTRACTOR] Extraction complete');
    return config;
  } catch (error) {
    console.error('[BUSINESS-EXTRACTOR] Extraction failed:', error);
    throw new Error(`Business config extraction failed: ${error.message}`);
  }
}

/**
 * Generate extraction prompt for Gemini
 */
function generateExtractionPrompt(idValue, domain, inputText) {
  return `You are a data extraction specialist. Extract business information from the following scraped website content and return it as a JSON object matching this exact structure:

{
  "id": "${idValue}",
  "name": "Business Name",
  "tagline": "Optional tagline",
  "brandIdentity": {
    "tone": "Warm, friendly, professional",
    "voice": "Conversational and educational",
    "keywords": ["aesthetics", "injectables", "skin", "laser"],
    "personaName": "Serena",
    "personaBackstory": "Serena is a knowledgeable and caring medspa concierge who helps clients understand treatments and feel comfortable booking."
  },
  "locations": [
    {
      "name": "Location Name",
      "address": "Full address",
      "phone": "Phone number",
      "email": "info@example.com",
      "parking": "Parking details if available"
    }
  ],
  "hours": {
    "mon-fri": "9am–6pm",
    "sat": "10am–5pm",
    "sun": "closed"
  },
  "team": [
    {
      "name": "Provider Name",
      "role": "Provider or Staff Role",
      "title": "Professional Title",
      "bio": "Short bio based on the about/team page.",
      "specialties": ["Injectables", "Laser"],
      "certifications": ["RN", "NP", "MD"]
    }
  ],
  "services": [
    {
      "name": "Service Name",
      "category": "Category (e.g., Injectables, Laser, Skin)",
      "descriptionShort": "One sentence overview.",
      "descriptionLong": "A detailed marketing description of the treatment, its benefits, and what to expect.",
      "benefits": ["Key benefit 1", "Key benefit 2"],
      "idealCandidate": "Who this treatment is best for.",
      "contraindications": ["Contraindication 1", "Contraindication 2"],
      "preCare": ["Pre-care instruction 1", "Pre-care instruction 2"],
      "postCare": ["Post-care instruction 1", "Post-care instruction 2"],
      "downtime": "Describe expected downtime, if any.",
      "frequency": "How often clients typically receive this treatment.",
      "durationMinutes": 30,
      "price": {
        "startingAt": 250,
        "range": "e.g., $250–$500",
        "perUnit": "e.g., per unit, per area",
        "notes": "Any pricing notes or disclaimers."
      },
      "faqs": [],
      "upsells": [],
      "crossSells": []
    }
  ],
  "memberships": [
    {
      "name": "Membership Name",
      "price": "$199/month",
      "perks": ["Perk 1", "Perk 2"],
      "terms": "Key terms and conditions."
    }
  ],
  "packages": [
    {
      "name": "Package Name",
      "servicesIncluded": ["Service A", "Service B"],
      "price": "$999",
      "savings": "Save 20% vs booking individually."
    }
  ],
  "policies": {
    "cancellation": "Cancellation policy text.",
    "noShow": "No-show policy text.",
    "late": "Late arrival policy text.",
    "refund": "Refund policy text.",
    "children": "Children policy text."
  },
  "faqs": [
    {
      "q": "Question",
      "a": "Answer"
    }
  ],
  "booking": {
    "type": "mock",
    "requiresPayment": false,
    "depositAmount": null,
    "url": "https://calendly.com/...",
    "instructions": "Any special booking instructions or notes."
  },
  "safety": {
    "disclaimers": ["High-level safety and medical disclaimers."],
    "redFlags": ["When to advise seeing a doctor or not proceeding."],
    "escalationRules": "When and how to escalate to a human."
  },
  "consultationFlows": {
    "botox": "Step-by-step consultation flow for Botox inquiries.",
    "filler": "Step-by-step consultation flow for filler inquiries.",
    "skincare": "Consultation flow for skincare/medical facials.",
    "weightLoss": "Consultation flow for weight loss programs.",
    "laser": "Consultation flow for laser treatments."
  },
  "aiBehavior": {
    "tone": "How the AI should sound.",
    "identity": "The AI's name and role.",
    "speakingStyle": "Short, friendly, and clear.",
    "greetingStyle": "Warm greeting with business name.",
    "salesStyle": "Soft, educational, not pushy.",
    "objectionHandling": "How to respond to common objections and hesitations.",
    "closingPhrases": ["Would you like me to help you book that?", "Can I answer anything else?"]
  },
  "memory": {
    "store": ["name", "preferences", "pastTreatments", "budget", "concerns"],
    "recallRules": "Use memory to personalize recommendations.",
    "privacyRules": "Never store medical history or PHI."
  }
}

IMPORTANT RULES:
1. Extract ALL services mentioned with their prices and descriptions and map them into the rich schema above.
2. For locations:
   - Parse every address and phone number found in the scraped text.
   - Include ALL locations as SEPARATE entries in the "locations" array.
   - Remove duplicates.
   - Clean messy formatting, line breaks, embedded links, or repeated text.
   - If the business has multiple locations, DO NOT default to placeholders.
   - Always extract real addresses, even if only partially formatted.
   - If ANY text resembles an address (street, avenue, road, suite, zip code), treat it as a valid location and extract it.
   - Format phone numbers in (XXX) XXX-XXXX when possible.
   - Never output "default", "not found", or placeholder text for address or phone if any address-like text exists.
3. Extract operating hours in any format, normalize to key-value pairs.
4. Extract FAQs, memberships, packages, and policies if available.
5. Look for booking/calendar links (Calendly, etc.) - set booking.type and booking.url accordingly.
6. Infer durations, pricing ranges, and ideal candidates based on typical medspa patterns when not explicitly stated.
7. If information is missing, use reasonable defaults while staying truthful to the website.
8. Infer brand tone, voice, and persona from the overall copy and imagery.
9. Return ONLY valid JSON, no markdown, no explanations.

${domain ? `Business domain: ${domain}\n` : ''}Scraped website content:
${inputText}`;
}

/**
 * Call Gemini API for extraction
 */
async function callGeminiAPI(prompt, apiKey) {
  const useServiceAccount = isServiceAccountConfigured();
  let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`;
  const headers = { 'Content-Type': 'application/json' };
  
  // Use service account authentication if configured, otherwise use API key
  if (useServiceAccount) {
    try {
      const accessToken = await getGeminiAccessToken();
      headers['Authorization'] = `Bearer ${accessToken}`;
    } catch (error) {
      console.error('[BUSINESS-EXTRACTOR] Failed to get access token from service account:', error.message);
      throw new Error(`Service account authentication failed: ${error.message}`);
    }
  } else {
    if (!apiKey) {
      throw new Error('Neither service account credentials nor API key provided');
    }
    url += `?key=${apiKey}`;
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  
  let jsonText = text.trim();
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  }
  
  const config = JSON.parse(jsonText);
  
  // Ensure required fields exist
  if (!config.services || config.services.length === 0) {
    config.services = [{
      name: 'Consultation',
      category: '',
      descriptionShort: 'Initial consultation',
      descriptionLong: '',
      benefits: [],
      idealCandidate: '',
      contraindications: [],
      preCare: [],
      postCare: [],
      downtime: '',
      frequency: '',
      durationMinutes: 30,
      price: { startingAt: 0, range: '', perUnit: '', notes: '' },
      faqs: [],
      upsells: [],
      crossSells: [],
    }];
  }
  
  if (!config.locations || config.locations.length === 0) {
    config.locations = [{
      name: 'Main Office',
      address: 'Address not found',
      phone: 'Phone not found',
      email: '',
      parking: '',
    }];
  }
  
  if (!config.hours || Object.keys(config.hours).length === 0) {
    config.hours = { 'mon-sun': '9am–6pm' };
  }
  
  if (!config.booking) {
    config.booking = {
      type: 'mock',
      requiresPayment: false,
      depositAmount: null,
      url: '',
      instructions: '',
    };
  }
  
  if (!config.aiBehavior) {
    config.aiBehavior = {
      tone: 'friendly, professional',
      identity: 'AI Receptionist',
      speakingStyle: '',
      greetingStyle: '',
      salesStyle: '',
      objectionHandling: '',
      closingPhrases: [],
    };
  }
  
  if (!config.memory) {
    config.memory = {
      store: ["name", "preferences", "pastTreatments", "budget", "concerns"],
      recallRules: "Use memory to personalize recommendations.",
      privacyRules: "Never store medical history or PHI.",
    };
  }
  
  return config;
}

/**
 * Store extracted config
 * - For businesses: stores in businesses.config_json
 * - For leads: stores in leads.scraped_data
 */
async function storeBusinessConfig({ leadId, businessId, config }) {
  const supabase = getSupabaseClient();

  const idValue = leadId || businessId;
  config.id = idValue;

  if (leadId) {
    // Store in leads table's scraped_data field
    const { error } = await supabase
      .from('leads')
      .update({
        scraped_data: config,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId);

    if (error) {
      throw new Error(`Failed to store lead config: ${error.message}`);
    }
  } else {
    // Store in businesses table's config_json field
    const { error } = await supabase
      .from('businesses')
      .update({
        config_json: config,
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessId);

    if (error) {
      throw new Error(`Failed to store business config: ${error.message}`);
    }
  }
}

