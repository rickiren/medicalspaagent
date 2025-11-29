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

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

export interface SimulationState {
  step: number;
  isTyping: boolean;
  sentiment: number;
  intent: string;
  recommendation: string | null;
  alert: string | null;
  paymentActive: boolean;
  bookingConfirmed: boolean;
}

export interface AudioVisualizerState {
  volume: number;
}

// Business Configuration Types (rich schema for AI agents)

export interface BrandIdentity {
  tone: string;
  voice: string;
  keywords: string[];
  personaName: string;
  personaBackstory: string;
}

export interface Location {
  name: string;
  address: string;
  phone: string;
  email?: string;
  parking?: string;
}

export interface Hours {
  [key: string]: string; // e.g., "mon-sun": "9am–6pm"
}

export interface FAQ {
  q: string;
  a: string;
}

export interface TeamMember {
  name: string;
  role: string;
  title: string;
  bio: string;
  specialties: string[];
  certifications: string[];
}

export interface ServicePrice {
  startingAt: number;
  range: string;
  perUnit: string;
  notes: string;
}

export interface Service {
  name: string;
  category: string;
  descriptionShort: string;
  descriptionLong: string;
  benefits: string[];
  idealCandidate: string;
  contraindications: string[];
  preCare: string[];
  postCare: string[];
  downtime: string;
  frequency: string;
  durationMinutes: number;
  price: ServicePrice;
  faqs: string[];
  upsells: string[];
  crossSells: string[];
}

export interface Membership {
  name: string;
  price: string;
  perks: string[];
  terms: string;
}

export interface Package {
  name: string;
  servicesIncluded: string[];
  price: string;
  savings: string;
}

export interface Policies {
  cancellation: string;
  noShow: string;
  late: string;
  refund: string;
  children: string;
}

export interface BookingConfig {
  type: 'mock' | 'calendly' | 'custom' | string;
  requiresPayment: boolean;
  depositAmount: number | null;
  url: string;
  instructions: string;
}

export interface SafetyConfig {
  disclaimers: string[];
  redFlags: string[];
  escalationRules: string;
}

export interface ConsultationFlows {
  botox: string;
  filler: string;
  skincare: string;
  weightLoss: string;
  laser: string;
}

export interface AiBehavior {
  tone: string;
  identity: string;
  speakingStyle: string;
  greetingStyle: string;
  salesStyle: string;
  objectionHandling: string;
  closingPhrases: string[];
}

export interface MemoryConfig {
  store: Array<'name' | 'preferences' | 'pastTreatments' | 'budget' | 'concerns' | string>;
  recallRules: string;
  privacyRules: string;
}

export interface BusinessConfig {
  id: string;
  name: string;
  tagline?: string;
  brandIdentity: BrandIdentity;
  locations: Location[];
  hours: Hours;
  team: TeamMember[];
  services: Service[];
  faqs?: FAQ[];
  memberships: Membership[];
  packages: Package[];
  policies: Policies;
  booking: BookingConfig;
  safety: SafetyConfig;
  consultationFlows: ConsultationFlows;
  aiBehavior: AiBehavior;
  memory: MemoryConfig;
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
