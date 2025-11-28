import { BusinessConfig } from '../types';

export async function normalizeToBusinessConfig(
  scrapedData: string,
  businessId: string,
  domain: string,
  apiKey: string
): Promise<BusinessConfig> {
  const prompt = `You are a data extraction specialist. Extract business information from the following scraped website content and return it as a JSON object matching this exact structure:

{
  "id": "${businessId}",
  "name": "Business Name",
  "tagline": "Optional tagline",
  "services": [
    {
      "name": "Service Name",
      "description": "Service description",
      "price": 250,
      "timeMinutes": 30
    }
  ],
  "locations": [
    {
      "name": "Location Name",
      "address": "Full address",
      "phone": "Phone number"
    }
  ],
  "hours": {
    "mon-fri": "9am–6pm",
    "sat": "10am–5pm",
    "sun": "closed"
  },
  "faqs": [
    {
      "q": "Question",
      "a": "Answer"
    }
  ],
  "booking": {
    "type": "mock",
    "calendarUrl": "https://calendly.com/...",
    "requiresPayment": false
  },
  "aiPersonality": {
    "tone": "friendly, warm, professional",
    "identity": "AI Receptionist"
  }
}

IMPORTANT RULES:
1. Extract ALL services mentioned with their prices and descriptions
2. Extract ALL locations with addresses and phone numbers
3. Extract operating hours in any format, normalize to key-value pairs
4. Extract FAQs if available
5. Look for booking/calendar links (Calendly, etc.) - set booking.type accordingly
6. Infer service durations (timeMinutes) based on typical medspa service lengths
7. If price is not found, use 0
8. If information is missing, use reasonable defaults
9. Return ONLY valid JSON, no markdown, no explanations

Scraped website content:
${scrapedData.substring(0, 8000)}`;

  try {
    // Use Gemini REST API directly
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    const config = JSON.parse(jsonText) as BusinessConfig;
    
    // Validate and set defaults
    if (!config.services || config.services.length === 0) {
      config.services = [{ name: 'Consultation', description: 'Initial consultation', price: 0, timeMinutes: 30 }];
    }
    
    if (!config.locations || config.locations.length === 0) {
      config.locations = [{ name: 'Main Office', address: 'Address not found', phone: 'Phone not found' }];
    }
    
    if (!config.hours || Object.keys(config.hours).length === 0) {
      config.hours = { 'mon-sun': '9am–6pm' };
    }
    
    if (!config.booking) {
      config.booking = { type: 'mock', requiresPayment: false };
    }
    
    if (!config.aiPersonality) {
      config.aiPersonality = { tone: 'friendly, professional', identity: 'AI Receptionist' };
    }
    
    // Ensure ID matches
    config.id = businessId;
    
    return config;
  } catch (error: any) {
    throw new Error(`Normalization failed: ${error.message}`);
  }
}

