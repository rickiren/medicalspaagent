export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
}

export interface BookingDetails {
  service: string;
  date: string;
  time: string;
  customerName?: string;
}

export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

export interface AudioVisualizerState {
  volume: number;
}

// Business Configuration Types
export interface Service {
  name: string;
  description: string;
  price: number;
  timeMinutes: number;
}

export interface Location {
  name: string;
  address: string;
  phone: string;
}

export interface Hours {
  [key: string]: string; // e.g., "mon-sun": "9am–6pm"
}

export interface FAQ {
  q: string;
  a: string;
}

export interface BookingConfig {
  type: 'mock' | 'calendly' | 'custom';
  calendarUrl?: string;
  requiresPayment: boolean;
}

export interface AIPersonality {
  tone: string;
  identity: string;
}

export interface BusinessConfig {
  id: string;
  name: string;
  tagline?: string;
  services: Service[];
  locations: Location[];
  hours: Hours;
  faqs?: FAQ[];
  booking: BookingConfig;
  aiPersonality: AIPersonality;
}

// Preview Landing Page Data Types
export interface PreviewLandingPageData {
  logo?: string;
  colors: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };
  hero: {
    title?: string;
    subtitle?: string;
    image?: string;
    ctaText?: string;
  };
  navigation: Array<{
    label: string;
    href: string;
  }>;
  sections: Array<{
    type: 'features' | 'services' | 'testimonials' | 'about';
    title?: string;
    content?: string;
    images?: string[];
  }>;
  images: string[];
  fonts?: {
    heading?: string;
    body?: string;
  };
  brandStyle?: {
    tone?: string;
    aesthetic?: string;
  };
}
