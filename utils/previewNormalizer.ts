import { PreviewLandingPageData } from '../types';

export async function normalizeToPreviewLandingPageData(
  scrapedData: string,
  scrapedImages: string[] | undefined,
  scrapedLinks: string[],
  metadata: any,
  businessName: string,
  apiKey: string
): Promise<PreviewLandingPageData> {
  const prompt = `You are a web design data extraction specialist. Extract visual and design information from the following scraped website content to create a preview landing page. Return it as a JSON object matching this exact structure:

{
  "logo": "URL to logo image or null",
  "colors": {
    "primary": "#hex color",
    "secondary": "#hex color",
    "accent": "#hex color",
    "background": "#hex color",
    "text": "#hex color"
  },
  "hero": {
    "title": "Main hero headline",
    "subtitle": "Hero subtext or tagline",
    "image": "URL to hero image",
    "ctaText": "Call to action button text"
  },
  "navigation": [
    {
      "label": "Nav item name",
      "href": "#section or URL"
    }
  ],
  "sections": [
    {
      "type": "features",
      "title": "Section title",
      "content": "Section description",
      "images": ["image URL"]
    }
  ],
  "images": ["array of all relevant image URLs"],
  "fonts": {
    "heading": "Font name for headings",
    "body": "Font name for body text"
  },
  "brandStyle": {
    "tone": "luxury, modern, medical, etc",
    "aesthetic": "minimalist, elegant, etc"
  }
}

IMPORTANT RULES:
1. Extract the main logo URL from images or metadata
2. Infer brand colors from the content (look for color mentions, CSS, or common medspa colors)
3. Extract hero section title and subtitle from the main heading
4. Extract navigation items from links or content structure
5. Identify key sections (features, services, testimonials, about)
6. Collect all relevant images (hero, services, team, etc.)
7. Infer font preferences from brand style
8. If information is missing, use reasonable defaults for a medical spa
9. Return ONLY valid JSON, no markdown, no explanations

Scraped website content:
${scrapedData.substring(0, 6000)}

Available images: ${scrapedImages?.slice(0, 10).join(', ') || 'none'}
Available links: ${scrapedLinks.slice(0, 20).join(', ') || 'none'}
Metadata: ${JSON.stringify(metadata || {}).substring(0, 1000)}`;

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
    
    const previewData = JSON.parse(jsonText) as PreviewLandingPageData;
    
    // Validate and set defaults
    if (!previewData.colors) {
      previewData.colors = {
        primary: '#f43f5e',
        secondary: '#8b5cf6',
        background: '#ffffff',
        text: '#1e293b',
      };
    }
    
    if (!previewData.hero) {
      previewData.hero = {
        title: `Welcome to ${businessName}`,
        subtitle: 'Experience our premium services',
        ctaText: 'Book Appointment',
      };
    }
    
    if (!previewData.navigation || previewData.navigation.length === 0) {
      previewData.navigation = [
        { label: 'Home', href: '#' },
        { label: 'Services', href: '#services' },
        { label: 'About', href: '#about' },
        { label: 'Contact', href: '#contact' },
      ];
    }
    
    if (!previewData.images) {
      previewData.images = scrapedImages || [];
    } else {
      // Merge with scraped images
      previewData.images = [...new Set([...previewData.images, ...(scrapedImages || [])])];
    }
    
    if (!previewData.sections || previewData.sections.length === 0) {
      previewData.sections = [
        {
          type: 'features',
          title: 'Why Choose Us',
          content: 'Experience world-class treatments',
        },
      ];
    }
    
    return previewData;
  } catch (error: any) {
    throw new Error(`Preview normalization failed: ${error.message}`);
  }
}

