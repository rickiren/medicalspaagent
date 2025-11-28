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
