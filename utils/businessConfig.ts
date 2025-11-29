import {
  AiBehavior,
  BrandIdentity,
  BookingConfig,
  BusinessConfig,
  Hours,
  Location,
  MemoryConfig,
  Package,
  Policies,
  SafetyConfig,
  Service,
  ServicePrice,
  TeamMember,
  Membership,
  ConsultationFlows,
  FAQ,
} from '../types';

/**
 * Normalize arbitrary business config JSON (including legacy configs)
 * into the new canonical BusinessConfig shape.
 */
export function normalizeBusinessConfig(raw: any): BusinessConfig {
  const id = String(raw?.id ?? '').trim();
  const name = String(raw?.name ?? '').trim();
  const tagline = typeof raw?.tagline === 'string' ? raw.tagline : '';

  // --- Brand Identity / AI behavior migration (from legacy aiPersonality) ---
  const legacyTone = raw?.aiPersonality?.tone || '';
  const legacyIdentity = raw?.aiPersonality?.identity || '';

  const brandIdentity: BrandIdentity = {
    tone: raw?.brandIdentity?.tone ?? legacyTone ?? '',
    voice: raw?.brandIdentity?.voice ?? '',
    keywords: Array.isArray(raw?.brandIdentity?.keywords)
      ? raw.brandIdentity.keywords.map(String)
      : [],
    personaName: raw?.brandIdentity?.personaName ?? legacyIdentity ?? '',
    personaBackstory: raw?.brandIdentity?.personaBackstory ?? '',
  };

  const aiBehavior: AiBehavior = {
    tone: raw?.aiBehavior?.tone ?? brandIdentity.tone ?? '',
    identity: raw?.aiBehavior?.identity ?? brandIdentity.personaName ?? legacyIdentity ?? 'AI Receptionist',
    speakingStyle: raw?.aiBehavior?.speakingStyle ?? '',
    greetingStyle: raw?.aiBehavior?.greetingStyle ?? '',
    salesStyle: raw?.aiBehavior?.salesStyle ?? '',
    objectionHandling: raw?.aiBehavior?.objectionHandling ?? '',
    closingPhrases: Array.isArray(raw?.aiBehavior?.closingPhrases)
      ? raw.aiBehavior.closingPhrases.map(String)
      : [],
  };

  // --- Locations / Hours ---
  const locations: Location[] = Array.isArray(raw?.locations) && raw.locations.length
    ? raw.locations.map((loc: any): Location => ({
        name: String(loc?.name ?? ''),
        address: String(loc?.address ?? ''),
        phone: String(loc?.phone ?? ''),
        email: loc?.email ? String(loc.email) : '',
        parking: loc?.parking ? String(loc.parking) : '',
      }))
    : [
        {
          name: 'Main Office',
          address: 'Address not provided',
          phone: 'Phone not provided',
          email: '',
          parking: '',
        },
      ];

  const hours: Hours =
    raw?.hours && typeof raw.hours === 'object' && !Array.isArray(raw.hours)
      ? raw.hours
      : { 'mon-sun': '9am–6pm' };

  // --- Team ---
  const team: TeamMember[] = Array.isArray(raw?.team)
    ? raw.team.map((member: any): TeamMember => ({
        name: String(member?.name ?? ''),
        role: String(member?.role ?? ''),
        title: String(member?.title ?? ''),
        bio: String(member?.bio ?? ''),
        specialties: Array.isArray(member?.specialties)
          ? member.specialties.map(String)
          : [],
        certifications: Array.isArray(member?.certifications)
          ? member.certifications.map(String)
          : [],
      }))
    : [];

  // --- Services (support legacy simple services) ---
  const normalizeService = (svc: any): Service => {
    // Legacy fields
    const legacyName = String(svc?.name ?? '');
    const legacyDescription = String(svc?.description ?? '');
    const legacyPrice =
      typeof svc?.price === 'number'
        ? svc.price
        : Number(svc?.price ?? 0) || 0;
    const legacyDuration =
      typeof svc?.timeMinutes === 'number'
        ? svc.timeMinutes
        : Number(svc?.durationMinutes ?? 0) || 30;

    const price: ServicePrice = {
      startingAt:
        typeof svc?.price?.startingAt === 'number'
          ? svc.price.startingAt
          : legacyPrice,
      range: svc?.price?.range ?? '',
      perUnit: svc?.price?.perUnit ?? '',
      notes: svc?.price?.notes ?? '',
    };

    return {
      name: svc?.name ?? legacyName,
      category: svc?.category ?? '',
      descriptionShort: svc?.descriptionShort ?? legacyDescription,
      descriptionLong: svc?.descriptionLong ?? '',
      benefits: Array.isArray(svc?.benefits) ? svc.benefits.map(String) : [],
      idealCandidate: svc?.idealCandidate ?? '',
      contraindications: Array.isArray(svc?.contraindications)
        ? svc.contraindications.map(String)
        : [],
      preCare: Array.isArray(svc?.preCare) ? svc.preCare.map(String) : [],
      postCare: Array.isArray(svc?.postCare) ? svc.postCare.map(String) : [],
      downtime: svc?.downtime ?? '',
      frequency: svc?.frequency ?? '',
      durationMinutes: typeof svc?.durationMinutes === 'number'
        ? svc.durationMinutes
        : legacyDuration,
      price,
      faqs: Array.isArray(svc?.faqs) ? svc.faqs.map(String) : [],
      upsells: Array.isArray(svc?.upsells) ? svc.upsells.map(String) : [],
      crossSells: Array.isArray(svc?.crossSells)
        ? svc.crossSells.map(String)
        : [],
    };
  };

  const services: Service[] = Array.isArray(raw?.services) && raw.services.length
    ? raw.services.map(normalizeService)
    : [
        normalizeService({
          name: 'Consultation',
          description: 'Initial consultation',
          price: 0,
          timeMinutes: 30,
        }),
      ];

  // --- Memberships / Packages ---
  const memberships: Membership[] = Array.isArray(raw?.memberships)
    ? raw.memberships.map((m: any): Membership => ({
        name: String(m?.name ?? ''),
        price: String(m?.price ?? ''),
        perks: Array.isArray(m?.perks) ? m.perks.map(String) : [],
        terms: String(m?.terms ?? ''),
      }))
    : [];

  const packages: Package[] = Array.isArray(raw?.packages)
    ? raw.packages.map((p: any): Package => ({
        name: String(p?.name ?? ''),
        servicesIncluded: Array.isArray(p?.servicesIncluded)
          ? p.servicesIncluded.map(String)
          : [],
        price: String(p?.price ?? ''),
        savings: String(p?.savings ?? ''),
      }))
    : [];

  // --- Policies ---
  const policies: Policies = {
    cancellation: raw?.policies?.cancellation ?? '',
    noShow: raw?.policies?.noShow ?? '',
    late: raw?.policies?.late ?? '',
    refund: raw?.policies?.refund ?? '',
    children: raw?.policies?.children ?? '',
  };

  // --- Booking (migrate from legacy booking) ---
  const legacyBooking = raw?.booking || {};
  const booking: BookingConfig = {
    type: legacyBooking.type ?? 'mock',
    requiresPayment:
      typeof legacyBooking.requiresPayment === 'boolean'
        ? legacyBooking.requiresPayment
        : false,
    depositAmount:
      typeof legacyBooking.depositAmount === 'number'
        ? legacyBooking.depositAmount
        : null,
    url: legacyBooking.url ?? legacyBooking.calendarUrl ?? '',
    instructions: legacyBooking.instructions ?? '',
  };

  // --- Safety ---
  const safety: SafetyConfig = {
    disclaimers: Array.isArray(raw?.safety?.disclaimers)
      ? raw.safety.disclaimers.map(String)
      : [],
    redFlags: Array.isArray(raw?.safety?.redFlags)
      ? raw.safety.redFlags.map(String)
      : [],
    escalationRules: raw?.safety?.escalationRules ?? '',
  };

  // --- Consultation Flows ---
  const consultationFlows: ConsultationFlows = {
    botox: raw?.consultationFlows?.botox ?? '',
    filler: raw?.consultationFlows?.filler ?? '',
    skincare: raw?.consultationFlows?.skincare ?? '',
    weightLoss: raw?.consultationFlows?.weightLoss ?? '',
    laser: raw?.consultationFlows?.laser ?? '',
  };

  // --- Memory ---
  const defaultStore: MemoryConfig['store'] = [
    'name',
    'preferences',
    'pastTreatments',
    'budget',
    'concerns',
  ];

  const memory: MemoryConfig = {
    store: Array.isArray(raw?.memory?.store)
      ? raw.memory.store
      : defaultStore,
    recallRules:
      raw?.memory?.recallRules ??
      'Use memory to personalize recommendations.',
    privacyRules:
      raw?.memory?.privacyRules ??
      'Never store medical history or PHI.',
  };

  // --- FAQs ---
  const faqs: FAQ[] | undefined = Array.isArray(raw?.faqs)
    ? raw.faqs.map((f: any): FAQ => ({
        q: String(f?.q ?? ''),
        a: String(f?.a ?? ''),
      }))
    : undefined;

  const config: BusinessConfig = {
    id,
    name,
    tagline,
    brandIdentity,
    locations,
    hours,
    team,
    services,
    faqs,
    memberships,
    packages,
    policies,
    booking,
    safety,
    consultationFlows,
    aiBehavior,
    memory,
  };

  return config;
}


