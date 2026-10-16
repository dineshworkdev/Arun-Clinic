/**
 * Reusable Rule-Based Dental Clinic FAQ and Intent Detection Engine
 * 
 * Provides deterministic, grounded, and polite conversational responses for:
 * 1. Greetings, capabilities, and bot identity
 * 2. Verified clinic information (address, timings, phone, parking, real-time open status)
 * 3. Dental services and procedures
 * 4. Appointment scheduling instructions and explicit booking intents
 * 5. Transparent pricing policy, payment methods (UPI, cards, EMI), and insurance
 * 6. Educational dental FAQs (pain levels, durations, preparation, hygiene)
 * 7. Urgent symptoms and safety-critical guidance (facial swelling, trauma, non-diagnostic triage)
 * 8. Context-aware follow-ups ("How much?", "Is it painful?", "How long does it take?")
 * 9. Non-repeating topic-specific fallbacks without repetitive apologies
 *
 * No external LLMs, AI APIs, or API keys required.
 */

import { CLINIC_INFO } from '../components/AIReceptionist/data/receptionistData.js';

/**
 * Normalizes input messages for robust keyword and pattern matching.
 * - Converts to lowercase and trims
 * - Normalizes punctuation and multiple whitespaces
 * - Fixes common spelling variations and informal terms
 */
export function normalizeMessage(message) {
  if (!message || typeof message !== 'string') return '';

  let normalized = message.toLowerCase().trim();

  // Replace common punctuation with whitespace while preserving alphanumeric characters
  normalized = normalized.replace(/[?!,.:;'"()[\]{}_+\\/\-–—*~`#@$%^&=<>]/g, ' ');

  // Collapse multiple whitespaces
  normalized = normalized.replace(/\s+/g, ' ').trim();

  // Common spelling typos and domain synonyms normalization
  const typoMap = [
    // Appointments
    { regex: /\b(apointment|appoinment|appoitment|appointmnt|apointmnt|appointmet)\b/g, replacement: 'appointment' },
    { regex: /\b(schedul|skedule|shedule|schdule)\b/g, replacement: 'schedule' },
    { regex: /\b(bookin|bok|bookking)\b/g, replacement: 'book' },
    // Doctors
    { regex: /\bdr\b/g, replacement: 'doctor' },
    { regex: /\b(doc|dentist|specialist|physician)\b/g, replacement: 'doctor' },
    // Anatomy & Procedures
    { regex: /\b(teath|teeh|toot|toothe)\b/g, replacement: 'teeth' },
    { regex: /\b(whitenning|whitning|brighten)\b/g, replacement: 'whitening' },
    { regex: /\b(cleanning|cleanig|scalng)\b/g, replacement: 'cleaning' },
    { regex: /\b(bracess|bracese|bracis)\b/g, replacement: 'braces' },
    { regex: /\b(invislin|invisalin|aligners?)\b/g, replacement: 'invisalign' },
    { regex: /\b(ortho|orthodontist)\b/g, replacement: 'orthodontics' },
    { regex: /\b(implnt|implnts|implantations?)\b/g, replacement: 'implant' },
    { regex: /\b(extration|extracshun)\b/g, replacement: 'extraction' },
    { regex: /\b(fillig|fillng)\b/g, replacement: 'filling' },
    { regex: /\b(veners|veneer)\b/g, replacement: 'veneers' },
    { regex: /\b(rct|canal)\b/g, replacement: 'root canal' },
    // Costs
    { regex: /\b(costing)\b/g, replacement: 'cost' },
    { regex: /\b(pricing)\b/g, replacement: 'price' },
    // Clinic Info
    { regex: /\b(loaction|locaton|adress|addres)\b/g, replacement: 'address' },
    { regex: /\b(phon|fone|telephon)\b/g, replacement: 'phone' },
    { regex: /\b(emergancy|urgnt|emmergency)\b/g, replacement: 'emergency' },
  ];

  for (const { regex, replacement } of typoMap) {
    normalized = normalized.replace(regex, replacement);
  }

  return normalized.replace(/\s+/g, ' ').trim();
}

/**
 * Creates initial conversation state with context tracking
 */
export function getInitialConversationState() {
  return {
    lastCategory: null,
    lastTreatment: null,
    lastDoctor: null,
    lastResponseText: '',
    lastFallbackIndices: {},
    isBookingActive: false,
    followUpCount: 0,
  };
}

/**
 * Check whether the clinic is open right now based on local operating schedule.
 * Hours: Monday – Friday: 8:00 AM – 6:00 PM
 * Saturday & Sunday: Closed for routine visits (Emergency triage 24/7 on call)
 */
export function getClinicOpenStatus() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentMinutes = hour * 60 + minute;
  const openMinutes = 8 * 60; // 8:00 AM
  const closeMinutes = 18 * 60; // 6:00 PM

  const isWeekday = day >= 1 && day <= 5;
  const isDuringHours = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  const isOpen = isWeekday && isDuringHours;

  return {
    isOpen,
    isWeekday,
    day,
    currentMinutes,
  };
}

/**
 * Detects treatment entity mentioned in user message
 */
function extractTreatment(text) {
  if (text.includes('root canal') || text.includes('endodontic')) {
    return { id: 'root-canal', title: 'Microscopic Root Canal Therapy', key: 'root-canal' };
  }
  if (text.includes('invisalign') || text.includes('braces') || text.includes('orthodontic') || text.includes('straighten')) {
    return { id: 'invisalign', title: 'Invisalign® Clear Aligners', key: 'braces' };
  }
  if (text.includes('implant') || text.includes('all on 4') || text.includes('all on 6') || text.includes('missing tooth')) {
    return { id: 'implants', title: 'Titanium & Zirconia Dental Implants', key: 'implants' };
  }
  if (text.includes('whiten') || text.includes('zoom whitening') || text.includes('laser whitening')) {
    return { id: 'whitening', title: 'Laser & Zoom™ Teeth Whitening', key: 'whitening' };
  }
  if (text.includes('clean') || text.includes('scaling') || text.includes('plaque') || text.includes('tartar')) {
    return { id: 'cleaning', title: 'Professional Hygienic Cleaning', key: 'cleaning' };
  }
  if (text.includes('veneer') || text.includes('lumineer') || text.includes('bonding') || text.includes('smile design')) {
    return { id: 'veneers', title: 'Custom Porcelain Veneers', key: 'veneers' };
  }
  if (text.includes('wisdom') || text.includes('extraction') || text.includes('pull tooth') || text.includes('surgical extraction')) {
    return { id: 'wisdom-teeth', title: 'Wisdom Teeth & Surgical Extractions', key: 'extractions' };
  }
  if (text.includes('filling') || text.includes('cavity') || text.includes('decay') || text.includes('composite')) {
    return { id: 'fillings', title: 'Tooth-Colored Composite Fillings', key: 'fillings' };
  }
  if (/\b(crowns?|bridges?|tooth cap|dental caps?)\b/.test(text)) {
    return { id: 'crowns', title: 'Porcelain & Ceramic Crowns & Bridges', key: 'crowns' };
  }
  if (/\b(pediatric|children|child|kids?)\b/.test(text)) {
    return { id: 'pediatric', title: 'Pediatric Dentistry & Protective Sealants', key: 'pediatric' };
  }
  if (text.includes('checkup') || text.includes('exam') || text.includes('diagnostic') || text.includes('cbct')) {
    return { id: 'general-exam', title: 'Comprehensive Exams & 3D Diagnostics', key: 'exam' };
  }
  return null;
}

/**
 * Detects specialist doctor mentioned in user message
 */
function extractDoctor(text) {
  if (text.includes('arun') || text.includes('kumar')) {
    return { id: 'dr-arun', name: 'Dr. Arun Kumar', role: 'Implantologist & Lead Clinician' };
  }
  if (text.includes('nicholas')) {
    return { id: 'dr-nicholas', name: 'Dr. Nicholas', role: 'Microscopic Endodontist' };
  }
  if (text.includes('blulah') || text.includes('joy')) {
    return { id: 'dr-blulah', name: 'Dr. Blulah Joy', role: 'Cosmetic Dentist & Architect' };
  }
  return null;
}

/**
 * Detects whether the query is purely informational about appointments
 * vs an explicit booking intent.
 */
function isInformationalBookingQuestion(rawText, norm) {
  // Informational patterns
  if (
    norm.startsWith('how do i book') ||
    norm.startsWith('how can i book') ||
    norm.startsWith('how to book') ||
    norm.includes('process of booking') ||
    norm.includes('booking process')
  ) {
    return 'APPT_HOW_TO_BOOK';
  }
  if (
    norm.includes('do i need appointment') ||
    norm.includes('need an appointment') ||
    norm.includes('can i walk in') ||
    norm.includes('walk in') ||
    norm.includes('without appointment')
  ) {
    return 'APPT_WALK_IN';
  }
  if (
    norm.includes('how do i cancel') ||
    norm.includes('can i cancel') ||
    norm.includes('cancel my appointment') ||
    norm.includes('cancellation') ||
    norm.includes('reschedule') ||
    norm.includes('change date') ||
    norm.includes('change my appointment')
  ) {
    return 'APPT_CANCEL_RESCHEDULE';
  }
  if (
    norm.includes('can i choose') ||
    norm.includes('choose a doctor') ||
    norm.includes('choose a dentist') ||
    norm.includes('select doctor') ||
    norm.includes('pick dentist')
  ) {
    return 'APPT_CHOOSE_DENTIST';
  }
  if (
    norm.includes('how long does an appointment take') ||
    norm.includes('how long is an appointment') ||
    norm.includes('how long does a visit take') ||
    norm.includes('duration of appointment')
  ) {
    return 'APPT_DURATION';
  }
  if (
    norm.includes('what should i bring') ||
    norm.includes('what to bring') ||
    norm.includes('documents to bring') ||
    norm.includes('before my appointment')
  ) {
    return 'APPT_PREPARATION';
  }
  if (
    norm.includes('check my appointment') ||
    norm.includes('status of appointment') ||
    norm.includes('track appointment') ||
    norm.includes('appointment confirmed')
  ) {
    return 'APPT_CHECK_STATUS';
  }
  return null;
}

/**
 * Main Intent Detection Engine
 * Evaluates priority order and conversation context.
 */
export function detectIntent(rawMessage, conversationContext = {}) {
  const norm = normalizeMessage(rawMessage);
  const context = conversationContext || {};

  // 1. EMERGENCY & RED-FLAG SAFETY DIRECTIVES (Highest Priority)
  // Severe facial/neck swelling affecting breathing or swallowing
  if (
    (norm.includes('breath') || norm.includes('swallow') || norm.includes('throat') || norm.includes('chok')) &&
    (norm.includes('swell') || norm.includes('face') || norm.includes('neck') || norm.includes('pain') || norm.includes('cant breathe'))
  ) {
    return { category: 'safety', intent: 'EMERGENCY_LIFE_THREAT', urgency: 'critical' };
  }
  if (norm.includes('cant breathe') || norm.includes('cannot breathe') || norm.includes('trouble breathing')) {
    return { category: 'safety', intent: 'EMERGENCY_LIFE_THREAT', urgency: 'critical' };
  }

  // Knocked out tooth (avulsion) or acute heavy bleeding
  if (
    norm.includes('knocked out') ||
    norm.includes('tooth fell out') ||
    norm.includes('tooth came out') ||
    norm.includes('uncontrolled bleed') ||
    norm.includes('heavy bleeding') ||
    norm.includes('mouth trauma') ||
    norm.includes('injured mouth')
  ) {
    return { category: 'safety', intent: 'EMERGENCY_TRAUMA', urgency: 'high' };
  }

  // Acute symptoms (facial swelling, severe toothache, broken tooth, bleeding gums)
  if (norm.includes('swollen face') || norm.includes('face is swollen') || norm.includes('facial swelling') || norm.includes('cheek is swollen')) {
    return { category: 'symptom', intent: 'SYMPTOM_FACIAL_SWELLING', urgency: 'high' };
  }
  if (norm.includes('broken tooth') || norm.includes('chipped tooth') || norm.includes('cracked tooth') || norm.includes('tooth broke')) {
    return { category: 'symptom', intent: 'SYMPTOM_BROKEN_TOOTH', urgency: 'medium' };
  }
  if (norm.includes('bleeding gum') || norm.includes('gums are bleeding') || norm.includes('blood when brushing')) {
    return { category: 'symptom', intent: 'SYMPTOM_BLEEDING_GUMS', urgency: 'medium' };
  }
  if (
    norm.includes('severe toothache') ||
    norm.includes('terrible toothache') ||
    norm.includes('toothache') ||
    norm.includes('tooth pain') ||
    norm.includes('teeth pain') ||
    norm.includes('tooth hurts') ||
    norm.includes('teeth hurt') ||
    (norm.includes('severe pain') && (norm.includes('tooth') || norm.includes('teeth') || norm.includes('mouth') || norm.includes('jaw') || norm.includes('gum') || context.lastTreatment))
  ) {
    return { category: 'symptom', intent: 'SYMPTOM_TOOTHACHE', urgency: 'high' };
  }
  if (norm.includes('sensitive tooth') || norm.includes('sensitive teeth') || norm.includes('tooth sensitivity') || norm.includes('hot and cold hurt')) {
    return { category: 'symptom', intent: 'SYMPTOM_SENSITIVITY', urgency: 'low' };
  }
  if (
    norm === 'emergency' ||
    norm.includes('dental emergency') ||
    norm.includes('tooth emergency') ||
    norm.includes('urgent dental') ||
    (norm.includes('emergency') && (norm.includes('tooth') || norm.includes('teeth') || norm.includes('mouth') || norm.includes('clinic') || norm.includes('doctor') || norm.includes('care')))
  ) {
    return { category: 'symptom', intent: 'EMERGENCY_GENERAL', urgency: 'high' };
  }

  // 2. CHECK FOR MULTI-PART CLINIC INQUIRIES
  const asksLocation = norm.includes('where') || norm.includes('address') || norm.includes('location') || norm.includes('reach');
  const asksHours = norm.includes('hours') || norm.includes('open') || norm.includes('close') || norm.includes('timing');
  if (asksLocation && asksHours) {
    return { category: 'clinic', intent: 'CLINIC_LOCATION_AND_HOURS' };
  }

  // 3. APPOINTMENT INFORMATIONAL QUESTIONS (Must not trigger booking flow directly)
  const infoApptIntent = isInformationalBookingQuestion(rawMessage, norm);
  if (infoApptIntent) {
    return { category: 'appointment_info', intent: infoApptIntent };
  }

  // Same-day appointment question
  if (
    norm.includes('same day appointment') ||
    norm.includes('visit today') ||
    norm.includes('come today') ||
    norm.includes('appointment today') ||
    norm.includes('see dentist today')
  ) {
    return { category: 'appointment_info', intent: 'APPT_SAME_DAY' };
  }

  // 4. EXPLICIT APPOINTMENT BOOKING INTENT
  const isExplicitBooking =
    norm.startsWith('i want to book') ||
    norm.startsWith('i need to book') ||
    norm.startsWith('please book') ||
    norm.startsWith('book an appointment') ||
    norm.startsWith('book appointment') ||
    norm.startsWith('schedule an appointment') ||
    norm.startsWith('schedule appointment') ||
    norm.startsWith('request an appointment') ||
    norm.startsWith('i need an appointment') ||
    norm.startsWith('i want an appointment') ||
    norm.startsWith('i need to see a doctor') ||
    norm.startsWith('i want to see a doctor') ||
    norm.startsWith('i need to see a dentist') ||
    norm.startsWith('i want to see a dentist') ||
    norm.startsWith('book a consultation') ||
    norm.startsWith('can i book an appointment') ||
    norm === 'book' ||
    norm === 'book appointment' ||
    norm === 'appointment';

  if (isExplicitBooking) {
    const extractedSvc = extractTreatment(norm) || (context.lastTreatment ? { title: context.lastTreatment } : null);
    const extractedDoc = extractDoctor(norm) || (context.lastDoctor ? { name: context.lastDoctor } : null);
    return {
      category: 'booking',
      intent: 'START_BOOKING_FLOW',
      service: extractedSvc ? extractedSvc.title : null,
      doctor: extractedDoc ? extractedDoc.name : null,
    };
  }

  // 5. CONTEXT-AWARE SHORT FOLLOW-UPS
  // e.g. "How much?", "What is the cost?", "Price?"
  const isPricingFollowUp =
    norm === 'price' ||
    norm === 'how much' ||
    norm === 'how much does it cost' ||
    norm === 'how much is it' ||
    norm === 'what about the cost' ||
    norm === 'what about the price' ||
    norm.startsWith('how much for that') ||
    norm.startsWith('what is the cost');

  if (isPricingFollowUp) {
    if (context.lastTreatment) {
      return {
        category: 'pricing',
        intent: 'PRICE_TREATMENT_CONTEXTUAL',
        treatment: context.lastTreatment,
      };
    }
    return { category: 'pricing', intent: 'PRICE_UNCLEAR_TREATMENT' };
  }

  // e.g. "Is it painful?", "Does it hurt?", "Is it safe?"
  const isPainFollowUp =
    norm === 'is it painful' ||
    norm === 'does it hurt' ||
    norm === 'will it hurt' ||
    norm === 'is it pain free' ||
    norm === 'is it safe' ||
    norm === 'what about pain';

  if (isPainFollowUp) {
    if (context.lastTreatment) {
      return {
        category: 'faq',
        intent: 'FAQ_TREATMENT_PAIN_CONTEXTUAL',
        treatment: context.lastTreatment,
      };
    }
    return { category: 'faq', intent: 'FAQ_GENERAL_PAIN' };
  }

  // e.g. "How long does it take?"
  const isDurationFollowUp =
    norm === 'how long does it take' ||
    norm === 'how much time' ||
    norm === 'how long is it' ||
    norm === 'how many visits';

  if (isDurationFollowUp) {
    if (context.lastTreatment) {
      return {
        category: 'faq',
        intent: 'FAQ_TREATMENT_DURATION_CONTEXTUAL',
        treatment: context.lastTreatment,
      };
    }
    return { category: 'faq', intent: 'FAQ_GENERAL_DURATION' };
  }

  // 6. SPECIFIC PRICING & PAYMENT INTENTS
  if (norm.includes('upi') || norm.includes('gpay') || norm.includes('phonepe') || norm.includes('paytm')) {
    return { category: 'pricing', intent: 'PAYMENT_UPI' };
  }
  if (norm.includes('payment method') || norm.includes('payment option') || norm.includes('accept card') || norm.includes('credit card') || norm.includes('modes of payment')) {
    return { category: 'pricing', intent: 'PAYMENT_METHODS' };
  }
  if (norm.includes('emi') || norm.includes('installment') || norm.includes('monthly plan') || norm.includes('financing')) {
    return { category: 'pricing', intent: 'PAYMENT_EMI' };
  }
  if (norm.includes('insurance') || norm.includes('mediclaim') || norm.includes('claim reimbursement')) {
    return { category: 'pricing', intent: 'PAYMENT_INSURANCE' };
  }
  if (norm.includes('free consultation') || norm.includes('consultation free') || norm.includes('consultation charge') || norm.includes('consultation price')) {
    return { category: 'pricing', intent: 'PRICE_CONSULTATION' };
  }

  // General or Specific Treatment Pricing
  const isPricingWord =
    norm.includes('price') ||
    norm.includes('cost') ||
    norm.includes('charges') ||
    norm.includes('charge') ||
    norm.includes('fee') ||
    norm.includes('rate') ||
    norm.includes('how much') ||
    norm.includes('expensive');

  if (isPricingWord) {
    const matchedSvc = extractTreatment(norm) || (context.lastTreatment ? { key: context.lastTreatment } : null);
    if (matchedSvc) {
      return {
        category: 'pricing',
        intent: 'PRICE_TREATMENT_SPECIFIC',
        treatment: matchedSvc.key || matchedSvc.id,
      };
    }

    const isGeneralDentalPricing =
      norm.includes('treatment charges') ||
      norm.includes('treatment charge') ||
      norm.includes('treatment cost') ||
      norm.includes('treatment price') ||
      norm.includes('dental charges') ||
      norm.includes('dental cost') ||
      norm.includes('dental price') ||
      norm.includes('clinic charges') ||
      norm.includes('clinic fee') ||
      norm.includes('price list') ||
      norm.includes('your charges') ||
      norm.includes('your fees') ||
      norm.includes('your prices') ||
      norm.includes('what are your charges') ||
      norm.includes('how expensive') ||
      norm === 'charges' ||
      norm === 'price' ||
      norm === 'cost';

    if (isGeneralDentalPricing) {
      return { category: 'pricing', intent: 'PRICE_GENERAL_POLICY' };
    }
  }

  // 7. CLINIC INFORMATION INTENTS
  if (norm.includes('parking') || norm.includes('valet')) {
    return { category: 'clinic', intent: 'CLINIC_PARKING' };
  }
  if (norm.includes('sunday') || norm.includes('saturday') || norm.includes('weekend')) {
    return { category: 'clinic', intent: 'CLINIC_WEEKEND_HOURS' };
  }
  if (norm.includes('holiday') || norm.includes('public holiday')) {
    return { category: 'clinic', intent: 'CLINIC_HOLIDAYS' };
  }
  if (norm.includes('open today') || norm.includes('open right now') || norm.includes('open now') || norm === 'are you open') {
    return { category: 'clinic', intent: 'CLINIC_OPEN_TODAY' };
  }
  if (
    norm.includes('hours') ||
    norm.includes('timings') ||
    norm.includes('open time') ||
    norm.includes('close time') ||
    norm.includes('opening hours') ||
    norm.includes('closing hours') ||
    norm.includes('operating hours') ||
    norm.includes('what time do you open') ||
    norm.includes('what time do you close') ||
    norm.includes('time do you open') ||
    norm.includes('time do you close') ||
    norm.includes('when are you open') ||
    norm.includes('when do you open') ||
    norm.includes('when do you close') ||
    ((norm.includes('what time') || norm.includes('when')) && (norm.includes('open') || norm.includes('close')))
  ) {
    return { category: 'clinic', intent: 'CLINIC_HOURS' };
  }
  if (
    norm.includes('address') ||
    norm.includes('location') ||
    norm.includes('where is') ||
    norm.includes('where are you') ||
    norm.includes('where are you located') ||
    norm.includes('how to reach') ||
    norm.includes('how can i reach') ||
    norm.includes('landmark') ||
    norm.includes('directions')
  ) {
    return { category: 'clinic', intent: 'CLINIC_ADDRESS' };
  }
  if (
    norm.includes('phone') ||
    norm.includes('contact') ||
    norm.includes('call') ||
    norm.includes('email') ||
    norm.includes('number') ||
    norm.includes('how can i contact')
  ) {
    return { category: 'clinic', intent: 'CLINIC_CONTACT' };
  }

  // 8. DOCTOR & SPECIALIST INTENTS
  const specificDoctor = extractDoctor(norm);
  if (specificDoctor) {
    return { category: 'doctors', intent: 'DOCTOR_SPECIFIC', doctor: specificDoctor };
  }
  if (norm.includes('doctor') || norm.includes('specialist') || norm.includes('dentist') || norm.includes('team') || norm.includes('clinician')) {
    return { category: 'doctors', intent: 'DOCTORS_LIST' };
  }

  // 9. COMMON DENTAL EDUCATIONAL FAQS
  if (norm.includes('cleaning hurt') || norm.includes('cleaning painful') || (norm.includes('clean') && norm.includes('pain'))) {
    return { category: 'faq', intent: 'FAQ_CLEANING_PAIN' };
  }
  if (norm.includes('root canal painful') || norm.includes('root canal hurt') || (norm.includes('root canal') && norm.includes('pain'))) {
    return { category: 'faq', intent: 'FAQ_ROOT_CANAL_PAIN' };
  }
  if (norm.includes('braces painful') || norm.includes('braces hurt') || (norm.includes('braces') && norm.includes('pain'))) {
    return { category: 'faq', intent: 'FAQ_BRACES_PAIN' };
  }
  if (norm.includes('whitening safe') || norm.includes('whitening damage enamel') || norm.includes('is whitening safe')) {
    return { category: 'faq', intent: 'FAQ_WHITENING_SAFE' };
  }
  if (norm.includes('how long') && norm.includes('root canal')) {
    return { category: 'faq', intent: 'FAQ_ROOT_CANAL_DURATION' };
  }
  if (norm.includes('how long') && (norm.includes('cleaning') || norm.includes('scaling'))) {
    return { category: 'faq', intent: 'FAQ_CLEANING_DURATION' };
  }
  if (norm.includes('before my appointment') || norm.includes('prepare for appointment') || norm.includes('before visit')) {
    return { category: 'faq', intent: 'FAQ_BEFORE_APPOINTMENT' };
  }
  if (norm.includes('maintain healthy teeth') || norm.includes('keep teeth clean') || norm.includes('oral hygiene tips')) {
    return { category: 'faq', intent: 'FAQ_DENTAL_HYGIENE' };
  }
  if (norm.includes('how often') && (norm.includes('visit') || norm.includes('dentist') || norm.includes('checkup'))) {
    return { category: 'faq', intent: 'FAQ_VISIT_FREQUENCY' };
  }
  if (norm.includes('why do gums bleed') || norm.includes('causes of bleeding gums') || norm.includes('reason for bleeding gums')) {
    return { category: 'faq', intent: 'FAQ_BLEEDING_GUMS_REASON' };
  }
  if (norm.includes('cause of tooth sensitivity') || norm.includes('why are teeth sensitive') || norm.includes('causes sensitivity')) {
    return { category: 'faq', intent: 'FAQ_SENSITIVITY_REASON' };
  }

  // 10. DENTAL SERVICES INQUIRIES
  // Check if user is asking about specific treatments (e.g. "Do you have braces?", "Do you do root canal?")
  const specificTreatment = extractTreatment(norm);
  if (specificTreatment) {
    return {
      category: 'services',
      intent: 'SERVICE_SPECIFIC',
      treatment: specificTreatment.key,
      serviceTitle: specificTreatment.title,
    };
  }

  // Unlisted or unusual dental treatments (e.g., acupuncture, plastic surgery, piercing)
  if (/\b(acupuncture|piercings?|tattoos?|plastic surgery|botox|hair transplants?)\b/.test(norm)) {
    return { category: 'services', intent: 'SERVICE_UNLISTED', query: rawMessage };
  }

  if (norm.includes('service') || norm.includes('treatment') || norm.includes('procedure') || norm.includes('what do you do') || norm.includes('what do you offer')) {
    return { category: 'services', intent: 'SERVICES_LIST' };
  }

  // 11. GREETINGS & GENERAL CONVERSATION
  if (norm === 'hi' || norm === 'hello' || norm === 'hey' || norm.startsWith('hi ') || norm.startsWith('hello ') || norm.startsWith('hey ')) {
    return { category: 'greeting', intent: 'GREETING_HELLO' };
  }
  if (norm.includes('good morning')) {
    return { category: 'greeting', intent: 'GREETING_MORNING' };
  }
  if (norm.includes('good afternoon')) {
    return { category: 'greeting', intent: 'GREETING_AFTERNOON' };
  }
  if (norm.includes('good evening')) {
    return { category: 'greeting', intent: 'GREETING_EVENING' };
  }
  if (norm.includes('thank') || norm === 'thx') {
    return { category: 'general', intent: 'COURTESY_THANKS' };
  }
  if (norm.includes('bye') || norm.includes('goodbye') || norm.includes('see you')) {
    return { category: 'general', intent: 'COURTESY_GOODBYE' };
  }
  if (norm.includes('what can you do') || norm.includes('how can you help') || norm === 'help' || norm === 'can you help me' || norm === 'i need help') {
    return { category: 'general', intent: 'BOT_CAPABILITIES' };
  }
  if (norm.includes('real person') || norm.includes('who am i talking to') || norm.includes('are you a bot') || norm.includes('are you human') || norm.includes('are you ai')) {
    return { category: 'general', intent: 'BOT_IDENTITY' };
  }

  // 12. TOPIC-SPECIFIC FALLBACK CLASSIFICATION
  if (
    norm.includes('tooth') ||
    norm.includes('teeth') ||
    norm.includes('mouth') ||
    norm.includes('enamel') ||
    norm.includes('jaw') ||
    norm.includes('gum') ||
    norm.includes('pulp') ||
    norm.includes('dental') ||
    norm.includes('dentist') ||
    norm.includes('dentistry') ||
    norm.includes('cavity') ||
    norm.includes('nerve') ||
    norm.includes('saliva') ||
    norm.includes('molar') ||
    norm.includes('tongue')
  ) {
    return { category: 'fallback_dental', intent: 'FALLBACK_DENTAL_UNKNOWN' };
  }
  if (
    norm.includes('clinic') ||
    norm.includes('office') ||
    norm.includes('sanctuary') ||
    norm.includes('desk') ||
    norm.includes('coimbatore') ||
    norm.includes('building') ||
    norm.includes('premises') ||
    norm.includes('facility')
  ) {
    return { category: 'fallback_clinic', intent: 'FALLBACK_CLINIC_UNKNOWN' };
  }
  if (norm.includes('rupee') || norm.includes('inr') || norm.includes('discount') || norm.includes('offer') || norm.includes('budget') || norm.includes('afford')) {
    return { category: 'fallback_price', intent: 'FALLBACK_PRICE_UNKNOWN' };
  }
  if (norm.includes('appointment') || norm.includes('slot') || norm.includes('visit') || norm.includes('consult')) {
    return { category: 'fallback_appt', intent: 'FALLBACK_APPT_UNKNOWN' };
  }

  // Unrelated or completely ambiguous questions
  return { category: 'fallback_unrelated', intent: 'FALLBACK_UNRELATED', query: rawMessage };
}

/**
 * Deterministic non-repeating variation selector.
 * Advances rotation index in context so consecutive responses never repeat identically.
 */
function selectVariation(pool, categoryKey, context) {
  if (!pool || pool.length === 0) return '';
  const indices = context.lastFallbackIndices || {};
  const prevIndex = typeof indices[categoryKey] === 'number' ? indices[categoryKey] : -1;
  const nextIndex = (prevIndex + 1) % pool.length;

  indices[categoryKey] = nextIndex;
  context.lastFallbackIndices = indices;
  return pool[nextIndex];
}

/**
 * Returns formatted FAQ or informational response based on detected intent
 */
export function getFaqResponse(intentResult, clinicConfig = CLINIC_INFO, context = {}) {
  const { intent, category } = intentResult;

  // Track treatment in context whenever a treatment is involved
  if (intentResult.treatment) {
    context.lastTreatment = intentResult.treatment;
  }
  if (intentResult.doctor) {
    context.lastDoctor = intentResult.doctor.name || intentResult.doctor;
  }
  context.lastCategory = category;

  // A. EMERGENCY & SAFETY
  if (intent === 'EMERGENCY_LIFE_THREAT') {
    return {
      type: 'text',
      text: "EMERGENCY: If you are experiencing difficulty breathing, swallowing, or severe spreading facial/neck swelling, please seek immediate emergency medical care at the nearest hospital emergency room (ER) or call local emergency services immediately. Do not wait for a dental appointment.",
      quickReplies: ['Call Emergency Line', 'Clinic Hours', 'Sanctuary Location'],
    };
  }

  if (intent === 'EMERGENCY_TRAUMA') {
    return {
      type: 'text',
      text: `For knocked-out permanent teeth or uncontrolled trauma, please call our 24/7 emergency hotline immediately at ${clinicConfig.emergencyPhone}.\n\nIf a tooth was knocked out: keep it moist in cold milk or saliva without touching the root, and reach our clinic within 60 minutes for the highest chance of saving it.`,
      quickReplies: ['Call Emergency Line', 'Clinic Location', 'Book Urgent Slot'],
    };
  }

  if (intent === 'SYMPTOM_FACIAL_SWELLING') {
    return {
      type: 'text',
      text: `Facial swelling can indicate an acute dental infection or abscess and requires prompt clinical assessment. You may apply a cold compress to the outside of your cheek, and we strongly advise contacting our concierge at ${clinicConfig.phone} or requesting an urgent priority consultation so our specialists can evaluate the cause safely.`,
      quickReplies: ['Book Priority Request', 'Call Clinic Desk', 'Emergency Hotline'],
    };
  }

  if (intent === 'SYMPTOM_BROKEN_TOOTH') {
    return {
      type: 'text',
      text: "If you have a broken or chipped tooth: rinse your mouth gently with warm water, avoid chewing on that side, and keep any broken pieces moist in clean saline or milk. Our specialists can restore damaged teeth using composite bonding, ceramic crowns, or veneers depending on the fracture.",
      quickReplies: ['Book Consultation', 'View Services', 'Clinic Hours'],
    };
  }

  if (intent === 'SYMPTOM_BLEEDING_GUMS') {
    return {
      type: 'text',
      text: "Bleeding gums are commonly a sign of plaque buildup, early gingivitis, or brushing too hard. A professional ultrasonic cleaning and periodontal checkup can remove hardened calculus and restore gum health. We recommend scheduling an examination to assess your gum condition.",
      quickReplies: ['Book Cleaning Visit', 'View Cleaning Details', 'Clinic Hours'],
    };
  }

  if (intent === 'SYMPTOM_TOOTHACHE') {
    return {
      type: 'text',
      text: `A persistent or severe toothache indicates underlying nerve inflammation, decay, or infection that requires clinical evaluation. Rinsing with warm salt water can provide temporary relief, but an examination with digital 3D imaging will pinpoint the root cause. Would you like to schedule an appointment?`,
      quickReplies: ['Book an Appointment', 'Meet Our Doctors', 'Emergency Hotline'],
    };
  }

  if (intent === 'SYMPTOM_SENSITIVITY') {
    return {
      type: 'text',
      text: "Tooth sensitivity to hot or cold is often caused by thinning enamel, exposed roots from receding gums, or micro-cracks. A dental examination can check for localized cavities and recommend protective desensitizing treatments or composite seals.",
      quickReplies: ['Book Consultation', 'Our Services', 'Clinic Hours'],
    };
  }

  if (intent === 'EMERGENCY_GENERAL') {
    return {
      type: 'text',
      text: `For urgent dental concerns, our clinic reserves emergency triage time slots daily. Please contact our 24/7 emergency line directly at ${clinicConfig.emergencyPhone} for immediate assistance.`,
      quickReplies: ['Call Emergency Line', 'Clinic Hours', 'Sanctuary Address'],
    };
  }

  // B. CLINIC INFORMATION
  if (intent === 'CLINIC_LOCATION_AND_HOURS') {
    return {
      type: 'clinic_contact',
      text: `We are located at ${clinicConfig.address} (${clinicConfig.landmark || 'near Nava India Signal'}). On-site valet parking is available.\n\nOur operating hours are Monday through Friday, 8:00 AM to 6:00 PM. We are closed on weekends for routine visits, with 24/7 emergency triage on call at ${clinicConfig.emergencyPhone}.`,
      quickReplies: ['Book an Appointment', 'Meet Our Doctors', 'Our Services'],
    };
  }

  if (intent === 'CLINIC_ADDRESS') {
    return {
      type: 'clinic_contact',
      text: `We are located at ${clinicConfig.address}. Landmark: ${clinicConfig.landmark || 'Near Nava India Signal'}. Convenient on-site valet parking is provided for all clinic visitors.`,
      quickReplies: ['Book an Appointment', 'Clinic Hours', 'Contact Numbers'],
    };
  }

  if (intent === 'CLINIC_HOURS') {
    return {
      type: 'clinic_hours',
      text: `Our clinic operating hours are:\n• ${clinicConfig.hours.weekdays}\n• ${clinicConfig.hours.weekends}\n\nOur on-call surgical team is reachable 24/7 for acute emergencies at ${clinicConfig.emergencyPhone}.`,
      quickReplies: ['Book an Appointment', 'Find Our Location', 'Contact Clinic'],
    };
  }

  if (intent === 'CLINIC_OPEN_TODAY') {
    const { isOpen, day, currentMinutes } = getClinicOpenStatus();
    let text = '';
    if (day === 0) {
      text = `The clinic is closed today (Sunday) for routine elective visits. Our regular hours are Monday through Friday, 8:00 AM to 6:00 PM. Urgent emergency triage is available 24/7 on call at ${clinicConfig.emergencyPhone}.`;
    } else if (day === 6) {
      text = `The clinic is closed today (Saturday) for routine appointments. Standard operating hours are Monday through Friday, 8:00 AM to 6:00 PM. For acute dental emergencies, our on-call team is reachable 24/7 at ${clinicConfig.emergencyPhone}.`;
    } else if (isOpen) {
      text = `Yes, the clinic is open today. Standard operating hours are Monday through Friday, 8:00 AM to 6:00 PM.`;
    } else if (currentMinutes < 8 * 60) {
      text = `The clinic opens today at 8:00 AM. Operating hours are Monday through Friday, 8:00 AM to 6:00 PM.`;
    } else {
      text = `The clinic has closed for routine visits for today. Our regular hours are Monday through Friday, 8:00 AM to 6:00 PM. Urgent dental emergency triage is available 24/7 on call at ${clinicConfig.emergencyPhone}.`;
    }
    return {
      type: 'clinic_hours',
      text,
      quickReplies: ['Book an Appointment', 'Clinic Hours', 'Emergency Contact'],
    };
  }

  if (intent === 'CLINIC_WEEKEND_HOURS') {
    return {
      type: 'clinic_hours',
      text: `The clinic is closed on Saturdays and Sundays for routine scheduled appointments. Our regular operating hours are Monday through Friday from 8:00 AM to 6:00 PM. Our on-call surgical team is available 24/7 for urgent dental emergencies at ${clinicConfig.emergencyPhone}.`,
      quickReplies: ['Book Weekday Appointment', 'Emergency Contact', 'Our Services'],
    };
  }

  if (intent === 'CLINIC_HOLIDAYS') {
    return {
      type: 'text',
      text: `On public holidays, routine scheduled appointments are typically paused or rescheduled, while our emergency on-call team remains available for acute trauma or severe pain at ${clinicConfig.emergencyPhone}. To verify holiday scheduling, please check with our concierge desk at ${clinicConfig.phone}.`,
      quickReplies: ['Call Clinic Desk', 'Clinic Hours', 'Book an Appointment'],
    };
  }

  if (intent === 'CLINIC_CONTACT') {
    return {
      type: 'clinic_contact',
      text: `You can reach our concierge desk directly at ${clinicConfig.phone} or via email at ${clinicConfig.email}. For urgent dental emergencies outside standard hours, call ${clinicConfig.emergencyPhone}.`,
      quickReplies: ['Book an Appointment', 'Clinic Location', 'Clinic Hours'],
    };
  }

  if (intent === 'CLINIC_PARKING') {
    return {
      type: 'text',
      text: `Yes, convenient on-site valet parking is available on premises at ${clinicConfig.address} for all clinic patients and visitors.`,
      quickReplies: ['Find Location', 'Clinic Hours', 'Book an Appointment'],
    };
  }

  // C. DOCTORS & SPECIALISTS
  if (intent === 'DOCTOR_SPECIFIC') {
    const doc = intentResult.doctor;
    context.lastDoctor = doc.name;
    return {
      type: 'doctors_list',
      text: `${doc.name} serves as our ${doc.role}. Availability: ${doc.availability || 'Consultations Mon-Fri'}. You can request a consultation with ${doc.name} directly below:`,
      quickReplies: [`Book with ${doc.name}`, 'Meet All Doctors', 'Our Services'],
    };
  }

  if (intent === 'DOCTORS_LIST') {
    return {
      type: 'doctors_list',
      text: "Our clinic is staffed by dedicated dental specialists with extensive experience in implants, microscopic root canals, and cosmetic aesthetics:",
      quickReplies: ['Book an Appointment', 'Our Services', 'Clinic Hours'],
    };
  }

  // D. SERVICES & TREATMENTS
  if (intent === 'SERVICES_LIST') {
    return {
      type: 'services_list',
      text: "We offer comprehensive digital dentistry across preventive, cosmetic, restorative, and orthodontic specialties. Explore our core services below:",
      quickReplies: ['Book an Appointment', 'Meet Our Doctors', 'Clinic Hours'],
    };
  }

  if (intent === 'SERVICE_SPECIFIC') {
    const key = intentResult.treatment;
    context.lastTreatment = key;

    const serviceMap = {
      braces: "We provide Invisalign® Clear Aligners as well as discreet ceramic aesthetic braces. Using 3D intraoral scans, you can preview projected alignment outcomes before treatment begins. Would you like to schedule an orthodontic consultation?",
      'root-canal': "Yes, we specialize in Microscopic Root Canal Therapy led by endodontist Dr. Nicholas. Using high-magnification microscopes and pain-free local anesthesia, we eliminate infection while preserving natural teeth. Would you like to request an appointment?",
      implants: "Yes, Dr. Arun Kumar specializes in Titanium & Zirconia Dental Implants and full-arch All-on-4/6 restorations with 3D surgical guide precision. Would you like to book an implant consultation?",
      cleaning: "Yes, we offer Professional Hygienic Cleaning & Polishing using gentle ultrasonic scaling and airflow stain removal for a fresh, healthy smile. Would you like to request a cleaning visit?",
      whitening: "Yes, we provide in-office Laser & Zoom™ Teeth Whitening supervised by cosmetic specialists, safely brightening your smile up to 8 shades in a 60-minute session. Would you like to schedule whitening?",
      veneers: "Yes, Dr. Blulah Joy crafts custom Porcelain Veneers & Lumineers to correct gaps, chips, and discoloration for a natural, harmonious smile. Would you like an aesthetic consultation?",
      fillings: "Yes, we provide biocompatible, tooth-colored composite resin fillings that bond seamlessly with your natural tooth shade. Would you like to arrange a visit?",
      extractions: "Yes, we perform gentle wisdom tooth and surgical extractions using piezoelectric ultrasonic instruments designed for faster recovery and minimal discomfort. Would you like to schedule an evaluation?",
      crowns: "Yes, we design precision-milled monolithic zirconia and ceramic porcelain crowns and bridges to restore chewing strength and appearance.",
      pediatric: "Yes, we offer gentle pediatric preventive dentistry, fluoride treatments, and protective sealants for children in a calm, welcoming environment.",
      exam: "Yes, we offer Comprehensive Exams & 3D Diagnostics with low-radiation 3D CBCT scans and digital photographs to give you a complete oral health assessment.",
    };

    const text = serviceMap[key] || "Yes, this service is offered at our clinic. Our clinical team can guide you through the process and arrange a consultation.";
    return {
      type: 'text',
      text,
      quickReplies: ['Book an Appointment', 'How Much Does It Cost?', 'Meet Our Doctors'],
    };
  }

  if (intent === 'SERVICE_UNLISTED') {
    return {
      type: 'text',
      text: "Our clinic focuses specifically on digital dentistry, dental implants, root canal therapy, orthodontics, cosmetic smile design, and preventive oral care. For procedures outside this scope, our clinic desk can confirm whether referral options are available. Would you like to check our listed treatments?",
      quickReplies: ['Our Services', 'Contact Clinic', 'Book an Appointment'],
    };
  }

  // E. APPOINTMENT INFORMATIONAL QUESTIONS
  if (intent === 'APPT_HOW_TO_BOOK') {
    return {
      type: 'text',
      text: `You can request an appointment directly in this chat by typing "Book an appointment", using our online booking form, or by calling our concierge desk at ${clinicConfig.phone}.\n\nOnline requests are provisional, and our clinic concierge team will contact you within 2 business hours via phone or WhatsApp to confirm your preferred slot.`,
      quickReplies: ['Book an Appointment', 'Our Services', 'Clinic Hours'],
    };
  }

  if (intent === 'APPT_WALK_IN') {
    return {
      type: 'text',
      text: "We operate primarily by scheduled appointments to ensure dedicated doctor time and minimal waiting. While walk-in patients are accommodated whenever schedule openings permit, booking in advance is strongly recommended. For acute emergencies, we prioritize same-day triage.",
      quickReplies: ['Book an Appointment', 'Call Clinic Desk', 'Emergency Hotline'],
    };
  }

  if (intent === 'APPT_CANCEL_RESCHEDULE') {
    return {
      type: 'text',
      text: `To cancel or reschedule an existing appointment, please contact our concierge desk directly at ${clinicConfig.phone} at least 24 hours in advance. There is no cancellation fee when notified 24 hours prior, allowing us to offer the slot to waiting patients.`,
      quickReplies: ['Call Clinic Desk', 'Book New Appointment', 'Clinic Hours'],
    };
  }

  if (intent === 'APPT_CHOOSE_DENTIST') {
    return {
      type: 'text',
      text: "Yes, you can request your preferred specialist when booking: Dr. Arun Kumar for Dental Implants & Full-Mouth Rehab, Dr. Nicholas for Microscopic Root Canal Therapy, or Dr. Blulah Joy for Cosmetic Smile Design.",
      quickReplies: ['Meet Our Doctors', 'Book with Dr. Arun', 'Book with Dr. Nicholas'],
    };
  }

  if (intent === 'APPT_DURATION') {
    return {
      type: 'text',
      text: "Routine dental checkups and professional cleanings generally take about 45 minutes. Specialized procedures such as Zoom™ whitening or surgical extractions take approximately 60 minutes, while complex restorative plans are customized to your treatment stages.",
      quickReplies: ['Book an Appointment', 'View Services', 'Clinic Hours'],
    };
  }

  if (intent === 'APPT_SAME_DAY') {
    return {
      type: 'text',
      text: `Routine appointments are scheduled in advance, though same-day openings occasionally become available due to schedule updates. For urgent pain or dental emergencies, we reserve priority daily slots. Please call our clinic desk directly at ${clinicConfig.phone} to check today's immediate openings.`,
      quickReplies: ['Call Clinic Desk', 'Book an Appointment', 'Emergency Hotline'],
    };
  }

  if (intent === 'APPT_PREPARATION') {
    return {
      type: 'text',
      text: "Please bring a valid photo ID, any recent dental X-rays or records you may have, and a list of current medications. We recommend eating a light meal beforehand (unless fasting is specified for sedation) and arriving 10 minutes early.",
      quickReplies: ['Book an Appointment', 'Clinic Location', 'Clinic Hours'],
    };
  }

  if (intent === 'APPT_CHECK_STATUS') {
    return {
      type: 'text',
      text: `Appointment requests submitted through our website or chat are provisional requests. Our concierge team reviews each submission and reaches out within 2 business hours via phone or WhatsApp to confirm your date and time slot. You can also call ${clinicConfig.phone} for immediate status updates.`,
      quickReplies: ['Call Clinic Desk', 'Book an Appointment', 'Clinic Hours'],
    };
  }

  // F. PRICING & PAYMENT INTENTS
  if (intent === 'PAYMENT_UPI') {
    return {
      type: 'text',
      text: "Yes, we accept UPI payments (Google Pay, PhonePe, Paytm, BHIM) along with Cash, all major Credit/Debit cards, Net Banking, and flexible interest-free EMI options.",
      quickReplies: ['Book an Appointment', 'View All Payment Options', 'Our Services'],
    };
  }

  if (intent === 'PAYMENT_METHODS') {
    return {
      type: 'text',
      text: "We accept Cash, UPI (Google Pay, PhonePe, etc.), all major Credit and Debit cards, Net Banking, and flexible 0% interest-free EMI financing plans for comprehensive dental procedures.",
      quickReplies: ['Book an Appointment', 'Do You Accept Insurance?', 'Our Services'],
    };
  }

  if (intent === 'PAYMENT_EMI') {
    return {
      type: 'text',
      text: "Yes, we offer flexible interest-free EMI payment plans for comprehensive procedures including dental implants, Invisalign® aligners, ceramic braces, and full smile makeovers.",
      quickReplies: ['Book Consultation', 'View Services', 'Contact Clinic'],
    };
  }

  if (intent === 'PAYMENT_INSURANCE') {
    return {
      type: 'text',
      text: "We provide comprehensive itemized bills, diagnosis reports, and clinical documentation to assist you in claiming reimbursement from private dental health insurance providers.",
      quickReplies: ['Book an Appointment', 'Payment Methods', 'Clinic Desk'],
    };
  }

  if (intent === 'PRICE_CONSULTATION') {
    return {
      type: 'text',
      text: `Our comprehensive diagnostic consultations include clinical examination and low-radiation 3D imaging where required. Consultations carry a standard diagnostic fee; our concierge desk at ${clinicConfig.phone} will be happy to confirm current consultation charges.`,
      quickReplies: ['Book Consultation', 'Call Clinic Desk', 'Our Services'],
    };
  }

  if (intent === 'PRICE_GENERAL_POLICY') {
    const priceGeneralPool = [
      "Because each patient's dental anatomy and clinical requirements are unique, exact itemized treatment costs are provided following a comprehensive 3D diagnostic evaluation. We guarantee transparent pricing with no hidden fees.",
      "Treatment charges depend on the specific procedure and individual oral health needs. Following an initial evaluation, our specialists provide a clear, itemized quotation before treatment begins.",
      "Our clinic provides transparent quotations following clinical assessment. Which specific dental procedure or treatment are you considering?",
      "To give you an accurate estimate, our specialists review your clinical requirements during a consultation. Which treatment would you like to ask about?",
    ];
    return {
      type: 'text',
      text: selectVariation(priceGeneralPool, 'price_general', context),
      quickReplies: ['Braces Cost', 'Implants Cost', 'Cleaning Cost', 'Book Consultation'],
    };
  }

  if (intent === 'PRICE_TREATMENT_SPECIFIC' || intent === 'PRICE_TREATMENT_CONTEXTUAL') {
    const key = intentResult.treatment;
    context.lastTreatment = key;

    const treatmentPricing = {
      braces: "Orthodontic charges depend on whether you select Invisalign® clear aligners or ceramic braces, as well as treatment duration. Following a 3D digital scan, we provide a complete itemized quotation, and flexible 0% interest EMI options are available.",
      'root-canal': "Root canal therapy fees depend on whether it involves an anterior tooth or a complex multi-rooted molar, and whether microscopic restoration is required. An itemized fee schedule is confirmed following 3D diagnostic imaging.",
      implants: "Dental implant charges depend on whether a single titanium root, zirconia option, or full-arch restoration (All-on-4/6) is needed, including any bone grafting. We provide transparent, itemized treatment plans with flexible installment options.",
      cleaning: "Professional hygienic cleaning charges depend on whether routine ultrasonic scaling and airflow polishing or deeper periodontal therapy is required. Our team confirms exact fees during your appointment.",
      whitening: "In-office clinical teeth whitening (such as laser or Zoom™ whitening) has a set procedure fee that includes clinical enamel protection. Our concierge team can confirm the current clinical whitening charge.",
      veneers: "Custom porcelain veneer fees depend on the number of teeth being restored and the ceramic materials selected. We provide a full quotation after a Digital Smile Design evaluation.",
      fillings: "Tooth-colored composite fillings vary based on the cavity size and tooth surface area. Exact charges are confirmed following an exam.",
      extractions: "Extraction charges depend on whether a simple removal or a surgical/piezoelectric wisdom tooth procedure is necessary. A diagnostic X-ray confirms the treatment plan.",
      crowns: "Porcelain and zirconia crown fees depend on the material selected (e.max porcelain or monolithic zirconia) and CAD/CAM milling requirements.",
    };

    const text = treatmentPricing[key] || "Treatment charges depend on clinical evaluation and procedure requirements. Our clinic provides an itemized quotation following examination.";
    return {
      type: 'text',
      text,
      quickReplies: ['Book an Appointment', 'Do You Offer EMI?', 'Our Services'],
    };
  }

  if (intent === 'PRICE_UNCLEAR_TREATMENT') {
    const pool = [
      "Treatment charges depend on the procedure and individual requirements. Which treatment are you considering?",
      "For an accurate quotation, our clinic team can confirm the current charges. Which procedure would you like to ask about?",
      "Different treatments have different charges. Tell me the procedure, and I will check whether pricing information is listed.",
      "I can help identify the treatment you are asking about. Which specific dental procedure would you like a price estimate for?",
    ];
    return {
      type: 'text',
      text: selectVariation(pool, 'price_unclear', context),
      quickReplies: ['Braces Cost', 'Implants Cost', 'Cleaning Cost', 'Book Consultation'],
    };
  }

  // G. EDUCATIONAL DENTAL FAQS
  if (intent === 'FAQ_CLEANING_PAIN') {
    return {
      type: 'text',
      text: "Professional teeth cleaning is generally very comfortable. Ultrasonic instruments gently lift plaque and calculus with water vibrations. If your gums or exposed roots are sensitive, we can apply a topical numbing gel for maximum comfort.",
      quickReplies: ['Book Cleaning Visit', 'How Long Does It Take?', 'Our Services'],
    };
  }

  if (intent === 'FAQ_ROOT_CANAL_PAIN') {
    return {
      type: 'text',
      text: "With modern microscopic techniques and targeted local anesthesia, a root canal procedure is virtually pain-free. In fact, the treatment is performed to eliminate the severe pain caused by infection inside the tooth and save your natural tooth.",
      quickReplies: ['Book Consultation', 'Meet Dr. Nicholas', 'How Long Does It Take?'],
    };
  }

  if (intent === 'FAQ_BRACES_PAIN') {
    return {
      type: 'text',
      text: "Getting braces or aligners placed is not painful. You may feel mild soreness or pressure for a few days after initial placement and routine adjustments as your teeth adapt to shifting, which resolves quickly.",
      quickReplies: ['Book an Appointment', 'Invisalign Details', 'Pricing Information'],
    };
  }

  if (intent === 'FAQ_WHITENING_SAFE') {
    return {
      type: 'text',
      text: "Yes, in-office clinical teeth whitening supervised by a dental specialist is safe and does not damage healthy enamel. We use controlled clinical gels that protect gums and minimize temporary tooth sensitivity.",
      quickReplies: ['Book Whitening', 'How Much Does It Cost?', 'Our Services'],
    };
  }

  if (intent === 'FAQ_ROOT_CANAL_DURATION') {
    return {
      type: 'text',
      text: "A microscopic root canal typically takes between 60 to 90 minutes. Depending on the complexity and infection level, it is completed in either a single visit or two appointments.",
      quickReplies: ['Book an Appointment', 'Is It Painful?', 'Meet Dr. Nicholas'],
    };
  }

  if (intent === 'FAQ_CLEANING_DURATION') {
    return {
      type: 'text',
      text: "A routine professional cleaning and airflow stain polishing appointment usually takes approximately 45 minutes.",
      quickReplies: ['Book Cleaning Visit', 'Does It Hurt?', 'Clinic Hours'],
    };
  }

  if (intent === 'FAQ_BEFORE_APPOINTMENT') {
    return {
      type: 'text',
      text: "Before your dental visit: eat a light meal, brush and floss your teeth gently, and bring any previous dental X-rays, records, or a list of current medications. Plan to arrive about 10 minutes early.",
      quickReplies: ['Book an Appointment', 'Clinic Location', 'Clinic Hours'],
    };
  }

  if (intent === 'FAQ_DENTAL_HYGIENE') {
    return {
      type: 'text',
      text: "To maintain optimal dental health: brush twice daily for two minutes using fluoride toothpaste, floss daily between teeth, replace your toothbrush every 3 months, limit sugary snacks, and visit the clinic every 6 months for preventive care.",
      quickReplies: ['Book Preventive Checkup', 'Our Services', 'Clinic Hours'],
    };
  }

  if (intent === 'FAQ_VISIT_FREQUENCY') {
    return {
      type: 'text',
      text: "We recommend scheduling a routine dental checkup and professional cleaning every 6 months to detect early enamel wear, prevent gum disease, and maintain healthy teeth.",
      quickReplies: ['Book Checkup', 'Our Services', 'Clinic Hours'],
    };
  }

  if (intent === 'FAQ_BLEEDING_GUMS_REASON') {
    return {
      type: 'text',
      text: "Gums bleed most often due to bacterial plaque accumulation and gingivitis, or occasionally from brushing too aggressively. A clinical examination and ultrasonic scaling can remove calculus and restore healthy tissue.",
      quickReplies: ['Book Cleaning Visit', 'View Services', 'Clinic Hours'],
    };
  }

  if (intent === 'FAQ_SENSITIVITY_REASON') {
    return {
      type: 'text',
      text: "Tooth sensitivity is commonly caused by worn enamel, exposed roots due to receding gums, hairline cracks, or early cavities. An examination can determine the exact cause and provide targeted relief.",
      quickReplies: ['Book an Appointment', 'Our Services', 'Clinic Hours'],
    };
  }

  if (intent === 'FAQ_TREATMENT_PAIN_CONTEXTUAL') {
    const key = intentResult.treatment;
    const painExplanations = {
      braces: "Placing braces or aligners is not painful. Patients commonly feel a mild sensation of tightness or pressure for a few days after adjustments, which settles down quickly.",
      'root-canal': "Microscopic root canal therapy is performed with targeted local anesthesia and is virtually pain-free. The procedure relieves infection and stops tooth pain.",
      implants: "Dental implant placement is performed under local anesthesia and is remarkably comfortable. Most patients report much less discomfort than they anticipated.",
      cleaning: "Professional cleaning with ultrasonic instruments is gentle and well tolerated. Topical numbing gel can be applied if you have sensitive gums.",
      whitening: "Clinical whitening is designed to protect enamel. Some patients experience mild temporary sensitivity for 24 to 48 hours, which resolves completely.",
      extractions: "Extractions are performed under deep local anesthesia ensuring you feel no pain during the procedure, only mild pressure.",
    };
    return {
      type: 'text',
      text: painExplanations[key] || "Our clinic prioritizes gentle, pain-free techniques and advanced anesthesia for patient comfort during all procedures.",
      quickReplies: ['Book an Appointment', 'How Long Does It Take?', 'Our Services'],
    };
  }

  if (intent === 'FAQ_TREATMENT_DURATION_CONTEXTUAL') {
    const key = intentResult.treatment;
    const durationExplanations = {
      braces: "Invisalign® and ceramic braces treatment times typically range from 6 to 18 months, depending on the degree of alignment needed.",
      'root-canal': "A microscopic root canal usually takes 60 to 90 minutes, completed in one or two visits.",
      implants: "Implant placement takes about 45 to 60 minutes per implant, followed by healing and custom crown placement.",
      cleaning: "A thorough hygienic cleaning and airflow polishing session takes approximately 45 minutes.",
      whitening: "In-office Zoom™ teeth whitening takes about 60 minutes in a single clinical visit.",
      extractions: "Wisdom teeth or surgical extractions typically take 45 to 60 minutes.",
    };
    return {
      type: 'text',
      text: durationExplanations[key] || "Procedure duration varies by individual clinical need. Our doctors provide exact timelines during your initial consultation.",
      quickReplies: ['Book an Appointment', 'Pricing Details', 'Our Services'],
    };
  }

  // H. GREETINGS & COURTESIES
  if (intent === 'GREETING_HELLO' || intent === 'GREETING_MORNING' || intent === 'GREETING_AFTERNOON' || intent === 'GREETING_EVENING') {
    const greetingPool = [
      "Hello! Welcome to Dental Clinic. I am the virtual receptionist. I can help with our treatments, clinic information, common dental questions, and appointment requests. How can I help you today?",
      "Hi there! Welcome to our dental clinic. I can assist you with procedure details, opening hours, specialist profiles, and scheduling appointments. What would you like to explore?",
      "Hello and welcome! I am your virtual receptionist. Whether you have questions about our treatments, clinic timings, or want to schedule a visit, I am here to help.",
      "Greetings! Welcome to our clinic. I can guide you through our dental services, provide clinic details, and help you request an appointment. What can I assist you with?",
      "Hello! Welcome. I am here to assist with all your clinic inquiries, specialist availability, and appointment scheduling. How may I guide you today?",
    ];
    return {
      type: 'text',
      text: selectVariation(greetingPool, 'greeting', context),
      quickReplies: ['Book an Appointment', 'Our Services', 'Clinic Hours', 'Meet Our Doctors'],
    };
  }

  if (intent === 'COURTESY_THANKS') {
    const thanksPool = [
      "You are very welcome! Please let me know if you have any other questions about our clinic or wish to request an appointment.",
      "Glad to assist! Feel free to ask if you need details about any other treatments or would like to schedule a visit.",
      "It is my pleasure. Let me know whenever you need assistance with clinic timings, doctor availability, or booking.",
      "Always happy to help! Let me know if there is anything else I can clarify for your dental care.",
    ];
    return {
      type: 'text',
      text: selectVariation(thanksPool, 'thanks', context),
      quickReplies: ['Book an Appointment', 'Our Services', 'Clinic Hours'],
    };
  }

  if (intent === 'COURTESY_GOODBYE') {
    const byePool = [
      "Thank you for contacting Dental Clinic. Have a wonderful day, and we look forward to welcoming you soon!",
      "Goodbye! Take good care of your smile, and feel free to reach out anytime you need assistance.",
      "Have a great day ahead! Our clinic team is here whenever you are ready to arrange your visit.",
      "Thank you for stopping by. Wishing you great oral health, and see you soon at the clinic!",
    ];
    return {
      type: 'text',
      text: selectVariation(byePool, 'goodbye', context),
      quickReplies: ['Book an Appointment', 'Clinic Hours', 'Sanctuary Address'],
    };
  }

  if (intent === 'BOT_CAPABILITIES') {
    return {
      type: 'text',
      text: "I can help you explore our dental services, find clinic information (location, timings, parking), understand common dental procedures, check transparent pricing policies, and request an appointment with our specialists.",
      quickReplies: ['Book an Appointment', 'Our Services', 'Clinic Hours', 'Meet Our Doctors'],
    };
  }

  if (intent === 'BOT_IDENTITY') {
    return {
      type: 'text',
      text: "I am the clinic's virtual receptionist. I assist patients using our verified clinic information and help arrange appointment requests. Our clinic healthcare team is always on hand for questions that need personalized clinical attention.",
      quickReplies: ['Book an Appointment', 'Our Services', 'Contact Clinic'],
    };
  }

  // I. TOPIC-SPECIFIC FALLBACKS (NO REPETITIVE APOLOGIES)
  if (intent === 'FALLBACK_DENTAL_UNKNOWN') {
    const pool = [
      "I can help with our listed treatments and common dental questions. What would you like to know about your dental care?",
      "Are you asking about a dental procedure, its cost, or what to expect during treatment? I can help with general information.",
      "Tell me a little more about your dental question, and I will guide you using the information available to me.",
      "I can share information about common dental procedures and our clinic services. Which topic are you interested in?",
      "Let us narrow that down. Is your question about a treatment, a symptom, or arranging a dental visit?",
      "I can help you explore our dental services or explain common procedures. What would you like to understand?",
    ];
    return {
      type: 'text',
      text: selectVariation(pool, 'fb_dental', context),
      quickReplies: ['Our Services', 'Book Consultation', 'Common Procedures', 'Clinic Hours'],
    };
  }

  if (intent === 'FALLBACK_CLINIC_UNKNOWN') {
    const pool = [
      "I can share the clinic details listed on this website. Which information are you looking for?",
      "Are you checking our location, timings, or contact details? I will help with the information available here.",
      "For details that are not listed, our clinic team can confirm the correct information. What would you like to check?",
      "Tell me which clinic detail you need, and I will check whether it is available in our information.",
      "I can help with our listed clinic information. Which detail would be most useful to you?",
      "Our clinic information covers our Coimbatore location, weekday hours, specialist team, and contact options. Which area can I help clarify?",
    ];
    return {
      type: 'text',
      text: selectVariation(pool, 'fb_clinic', context),
      quickReplies: ['Clinic Location', 'Clinic Hours', 'Contact Numbers', 'Book an Appointment'],
    };
  }

  if (intent === 'FALLBACK_PRICE_UNKNOWN') {
    const pool = [
      "Treatment charges depend on the procedure and individual requirements. Which treatment are you considering?",
      "For an accurate quotation, our clinic team can confirm the current price. Which procedure would you like to ask about?",
      "Different treatments have different charges. Tell me the procedure, and I will check whether a price is listed.",
      "I can help identify the treatment you are asking about. The clinic team can provide the confirmed quotation if the price is not listed here.",
      "Are you checking the cost of a particular treatment? I can look for the pricing information available on our website.",
      "We provide itemized treatment plans following diagnostic evaluation. Which specific dental procedure would you like a price estimate for?",
    ];
    return {
      type: 'text',
      text: selectVariation(pool, 'fb_price', context),
      quickReplies: ['Braces Cost', 'Implants Cost', 'Cleaning Cost', 'Book Consultation'],
    };
  }

  if (intent === 'FALLBACK_APPT_UNKNOWN') {
    const pool = [
      "I can help guide you through booking a visit or answer questions about our appointment process. Would you like to request an appointment now?",
      "We offer online appointment requests right here in the chat as well as by phone. What would you like to know about scheduling?",
      "If you would like to arrange a visit with one of our specialists, I can open the booking request form for you. Shall we proceed?",
      "Our clinic team accommodates scheduled visits Monday through Friday. Would you like assistance selecting a service or scheduling a slot?",
      "I can help you schedule a consultation or explain what to expect during your appointment. How can I assist with your visit?",
    ];
    return {
      type: 'text',
      text: selectVariation(pool, 'fb_appt', context),
      quickReplies: ['Book an Appointment', 'Clinic Hours', 'Our Services'],
    };
  }

  // General unrelated fallback
  const unrelatedPool = [
    "I am here to help with our dental clinic, treatments, and appointments. If you are planning a dental visit, I can help you explore our services or request an appointment.",
    "My focus is assisting with dental care, clinic timings, specialist consultations, and appointment requests. How can I help with your dental needs today?",
    "I specialize in answering questions about our dental practice, procedures, and scheduling. Let me know if you would like information on our treatments or clinic details.",
    "I can assist with clinic information, dental treatments, and scheduling visits with our specialists. Feel free to ask about our services or arrange an appointment.",
    "While I can only assist with dental healthcare and our clinic services, I would be glad to help you book a visit or explore our treatments.",
    "I am the clinic virtual receptionist and can help you with dental appointments, clinic hours, location, and treatments. What dental topic can I assist you with?",
  ];

  return {
    type: 'text',
    text: selectVariation(unrelatedPool, 'fb_unrelated', context),
    quickReplies: ['Book an Appointment', 'Our Services', 'Clinic Hours', 'Contact Clinic'],
  };
}

/**
 * End-to-end message handler for patient input
 * Coordinates normalization, intent detection, booking flow triggering, and response generation.
 */
export function handlePatientMessage(rawMessage, conversationState = null) {
  const state = conversationState || getInitialConversationState();
  const trimmed = (rawMessage || '').trim();

  if (!trimmed) {
    return {
      success: true,
      type: 'text',
      message: "Please feel free to ask a question or request an appointment.",
      quickReplies: ['Book an Appointment', 'Our Services', 'Clinic Hours'],
      updatedState: state,
    };
  }

  // 1. Detect Intent
  const intentResult = detectIntent(trimmed, state);

  // 2. Handle Explicit Booking
  if (intentResult.category === 'booking' && intentResult.intent === 'START_BOOKING_FLOW') {
    state.isBookingActive = true;
    state.lastCategory = 'booking';
    if (intentResult.service) {
      state.lastTreatment = intentResult.service;
    }

    const preselectedService = intentResult.service || null;
    const preselectedDoctor = intentResult.doctor || null;

    let textPrompt = "Of course! I would be delighted to help you request an appointment. Please select your preferred treatment and schedule details below:";
    if (preselectedService && preselectedDoctor) {
      textPrompt = `Certainly! I have pre-selected "${preselectedService}" with ${preselectedDoctor}. Please choose your preferred date and time slot below:`;
    } else if (preselectedService) {
      textPrompt = `Certainly! I have pre-selected "${preselectedService}" for your appointment request. Please select your preferred date and time slot below:`;
    } else if (preselectedDoctor) {
      textPrompt = `Certainly! Let us arrange your consultation with ${preselectedDoctor}. Please select your preferred treatment, date, and time slot below:`;
    }

    return {
      success: true,
      type: 'appointment_flow',
      message: textPrompt,
      initialService: preselectedService,
      initialDoctor: preselectedDoctor,
      quickReplies: ['View Services', 'Clinic Hours', 'Contact Clinic'],
      updatedState: state,
    };
  }

  // 3. Generate Predefined Response for General, Clinic, FAQ, or Fallback Intents
  const response = getFaqResponse(intentResult, CLINIC_INFO, state);
  state.lastResponseText = response.text;

  // If booking was previously active and patient asked an informational question,
  // we add a helpful note without breaking the booking state
  if (state.isBookingActive && response.type === 'text') {
    response.text += "\n\n(Your appointment request form above remains available whenever you are ready to proceed.)";
  }

  return {
    success: true,
    type: response.type || 'text',
    message: response.text,
    quickReplies: response.quickReplies || ['Book an Appointment', 'Our Services', 'Clinic Hours'],
    updatedState: state,
  };
}

export default {
  normalizeMessage,
  detectIntent,
  getFaqResponse,
  handlePatientMessage,
  getInitialConversationState,
  getClinicOpenStatus,
};
