import { ScrapeResult } from './scraper';

export interface ContactInfo {
  emails?: string[];
  phones?: string[];
  addresses?: string[];
  social?: {
    instagram?: string | null;
    facebook?: string | null;
    tiktok?: string | null;
    youtube?: string | null;
    twitter?: string | null;
  };
  bookingLinks?: string[];
  contactPage?: string | null;
  hours?: string[];
  mapsLink?: string | null;
}

export function extractContactInfo(firecrawlData: ScrapeResult): ContactInfo {
  const text = firecrawlData.markdown || '';
  const links = firecrawlData.links || [];
  const rawHtml = firecrawlData.rawData?.html || firecrawlData.rawData?.rawHtml || '';
  
  // Extract emails
  const emails: string[] = [];
  const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
  const textEmails = text.match(emailRegex) || [];
  emails.push(...textEmails);
  
  // Extract from mailto links
  const mailtoRegex = /mailto:([^"'\s<>]+)/gi;
  let match;
  while ((match = mailtoRegex.exec(rawHtml)) !== null) {
    const email = match[1].split('?')[0].trim(); // Remove query params
    if (email && !emails.includes(email)) {
      emails.push(email);
    }
  }
  
  // Extract phones
  const phones: string[] = [];
  // US phone formats: (123) 456-7890, 123-456-7890, 123.456.7890, 1234567890, +1 123-456-7890
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const textPhones = text.match(phoneRegex) || [];
  phones.push(...textPhones);
  
  // Extract from tel links
  const telRegex = /tel:([^"'\s<>]+)/gi;
  while ((match = telRegex.exec(rawHtml)) !== null) {
    const phone = match[1].split('?')[0].trim();
    if (phone && !phones.includes(phone)) {
      phones.push(phone);
    }
  }
  
  // Extract addresses
  const addresses: string[] = [];
  // Look for street addresses with common patterns
  const addressRegex = /\d{2,5}\s+[A-Za-z0-9\s.,#-]+(?:Street|St|Avenue|Ave|Blvd|Boulevard|Road|Rd|Drive|Dr|Lane|Ln|Way|Suite|Ste|Unit|Apt|#)\b[^.!?]*/gi;
  const textAddresses = text.match(addressRegex) || [];
  addresses.push(...textAddresses);
  
  // Helper to extract URL from link (handles string or object)
  const getUrl = (link: any): string | null => {
    if (typeof link === 'string') return link;
    if (link?.url) return link.url;
    if (link?.href) return link.href;
    return null;
  };
  
  // Extract social links
  const social: ContactInfo['social'] = {
    instagram: null,
    facebook: null,
    tiktok: null,
    youtube: null,
    twitter: null,
  };
  
  links.forEach(link => {
    const url = getUrl(link);
    if (!url) return;
    
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('instagram.com') && !social.instagram) {
      social.instagram = url;
    } else if (lowerUrl.includes('facebook.com') && !social.facebook) {
      social.facebook = url;
    } else if (lowerUrl.includes('tiktok.com') && !social.tiktok) {
      social.tiktok = url;
    } else if (lowerUrl.includes('youtube.com') && !social.youtube) {
      social.youtube = url;
    } else if ((lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) && !social.twitter) {
      social.twitter = url;
    }
  });
  
  // Extract booking links
  const bookingKeywords = ['book', 'schedule', 'appointment', 'calendly', 'acuity', 'square', 'reservations'];
  const bookingLinks: string[] = [];
  
  links.forEach(link => {
    const url = getUrl(link);
    if (!url) return;
    
    const lowerUrl = url.toLowerCase();
    
    if (bookingKeywords.some(keyword => lowerUrl.includes(keyword))) {
      if (!bookingLinks.includes(url)) {
        bookingLinks.push(url);
      }
    }
  });
  
  // Find contact page
  let contactPage: string | null = null;
  links.forEach(link => {
    const url = getUrl(link);
    if (!url) return;
    
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('contact') && !contactPage) {
      contactPage = url;
    }
  });
  
  // Extract hours
  const hours: string[] = [];
  // Match patterns like "9am-6pm", "9:00 AM - 5:00 PM", "9am–6pm" (with en dash)
  const hoursRegex = /\b\d{1,2}(?::\d{2})?\s?(am|pm|AM|PM)\s?[-–—]\s?\d{1,2}(?::\d{2})?\s?(am|pm|AM|PM)\b/gi;
  const textHours = text.match(hoursRegex) || [];
  hours.push(...textHours);
  
  // Find Google Maps link
  let mapsLink: string | null = null;
  links.forEach(link => {
    const url = getUrl(link);
    if (!url) return;
    
    if (url.includes('google.com/maps') || url.includes('maps.google.com')) {
      mapsLink = url;
    }
  });
  
  // Remove duplicates and clean up
  const uniqueEmails = [...new Set(emails.map(e => e.toLowerCase()))];
  const uniquePhones = [...new Set(phones)];
  const uniqueAddresses = [...new Set(addresses.map(a => a.trim()))];
  const uniqueHours = [...new Set(hours)];
  
  return {
    emails: uniqueEmails.length > 0 ? uniqueEmails : undefined,
    phones: uniquePhones.length > 0 ? uniquePhones : undefined,
    addresses: uniqueAddresses.length > 0 ? uniqueAddresses : undefined,
    social: Object.values(social).some(v => v !== null) ? social : undefined,
    bookingLinks: bookingLinks.length > 0 ? bookingLinks : undefined,
    contactPage: contactPage || undefined,
    hours: uniqueHours.length > 0 ? uniqueHours : undefined,
    mapsLink: mapsLink || undefined,
  };
}

