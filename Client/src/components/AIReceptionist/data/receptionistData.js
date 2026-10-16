// Clinic data and simulated conversation knowledge base
// Reusing real clinic services, doctors, and location info from the website

export const CLINIC_INFO = {
  name: 'Dental Clinic',
  tagline: 'Modern Digital Dentistry & Aesthetics',
  address: '12/A, Nava India, Coimbatore, Tamil Nadu',
  phone: '+91 98765 43210',
  emergencyPhone: '+91 98765 43211',
  email: 'concierge@dentalclinic.com',
  hours: {
    weekdays: 'Mon - Fri: 8:00 AM – 6:00 PM',
    weekends: 'Sat - Sun: Closed (Emergency on call)',
  },
  landmark: 'Near Nava India Signal, convenient valet parking available on-site',
  parking: 'Convenient valet parking is available on premises for all clinic visitors.',
  policies: {
    appointment: 'Appointments requested online or via the chat are provisional requests. The clinic concierge team will contact the patient within 2 business hours via phone or WhatsApp to confirm slot availability.',
    cancellation: 'We request at least 24 hours prior notice for cancellations or rescheduling. There is no cancellation fee when notified 24 hours in advance.',
    pricing: 'Because every patient has unique anatomical requirements, exact itemized treatment costs are provided following a comprehensive 3D diagnostic evaluation. We guarantee 100% transparent pricing with no hidden charges.',
    paymentMethods: 'Cash, UPI, all major Credit/Debit cards, Net Banking, and flexible interest-free EMI financing options are available.',
    insurance: 'We provide comprehensive itemized bills and clinical documentation to assist patients in claiming reimbursement from private dental health insurance providers.',
  },
  availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  timeSlots: [
    '09:00 AM',
    '10:30 AM',
    '11:45 AM',
    '02:00 PM',
    '03:30 PM',
    '04:45 PM',
  ],
};

export const CLINIC_DOCTORS = [
  {
    id: 'dr-arun',
    name: 'Dr. Arun Kumar',
    role: 'Implantologist & Lead Clinician',
    experience: '15+ Yrs Exp',
    specialties: ['Full-Mouth Rehab', 'Dental Implants', 'Bone Grafting'],
    image: '/faces/arun.jpg',
    availability: 'Mon, Wed, Fri',
  },
  {
    id: 'dr-nicholas',
    name: 'Dr. Nicholas',
    role: 'Microscopic Endodontist',
    experience: '12+ Yrs Exp',
    specialties: ['Microscopic Root Canal', 'Tooth Preservation', 'Pain-Free Tech'],
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
    availability: 'Tue, Thu, Fri',
  },
  {
    id: 'dr-blulah',
    name: 'Dr. Blulah Joy',
    role: 'Cosmetic Dentist & Architect',
    experience: '10+ Yrs Exp',
    specialties: ['Smile Design', 'Porcelain Veneers', 'Aesthetic Harmony'],
    image: 'https://images.pexels.com/photos/31043311/pexels-photo-31043311.jpeg',
    availability: 'Mon, Tue, Thu',
  },
];

export const CLINIC_SERVICES = [
  {
    id: 'general-exam',
    title: 'Comprehensive Exams & 3D Diagnostics',
    category: 'General & Preventive',
    duration: '45 Mins',
    description: 'Thorough digital evaluation of teeth, gums, and jaw using low-radiation 3D imaging.',
    badge: 'Foundation',
  },
  {
    id: 'cleaning',
    title: 'Professional Hygienic Cleaning',
    category: 'General & Preventive',
    duration: '45 Mins',
    description: 'Gentle ultrasonic removal of plaque and tartar with airflow stain polishing.',
    badge: 'Essential',
  },
  {
    id: 'veneers',
    title: 'Custom Porcelain Veneers',
    category: 'Cosmetic Dentistry',
    duration: '2-3 Visits',
    description: 'Ultra-thin, hand-crafted ceramic shells bonded for a red-carpet flawless smile.',
    badge: 'Signature',
  },
  {
    id: 'whitening',
    title: 'Laser & Zoom™ Teeth Whitening',
    category: 'Cosmetic Dentistry',
    duration: '60 Mins',
    description: 'In-office clinical whitening brightening your smile up to 8 shades safely.',
    badge: 'Popular',
  },
  {
    id: 'implants',
    title: 'Titanium & Zirconia Dental Implants',
    category: 'Restorative & Implants',
    duration: 'Multi-Stage',
    description: 'Permanent replacement roots with 99.2% clinical success rate.',
    badge: 'Gold Standard',
  },
  {
    id: 'root-canal',
    title: 'Microscopic Root Canal Therapy',
    category: 'Restorative & Implants',
    duration: 'Same Day',
    description: 'High-precision micro-invasive therapy to eliminate pain and save natural teeth.',
    badge: 'Pain-Free',
  },
  {
    id: 'invisalign',
    title: 'Invisalign® Clear Aligners',
    category: 'Orthodontics',
    duration: 'Custom Plan',
    description: 'Virtually invisible removable aligners tailored to your digital smile preview.',
    badge: 'Discreet',
  },
  {
    id: 'wisdom-teeth',
    title: 'Wisdom Teeth & Surgical Extractions',
    category: 'Specialty & Surgical',
    duration: '60 Mins',
    description: 'Gentle ultrasonic piezo surgical extractions with rapid recovery protocols.',
    badge: 'Specialized',
  },
];

export const QUICK_ACTIONS = [
  { id: 'book', label: 'Book an Appointment', intent: 'book_appointment' },
  { id: 'services', label: 'Our Services', intent: 'view_services' },
  { id: 'hours', label: 'Clinic Hours', intent: 'view_hours' },
  { id: 'doctors', label: 'Meet Our Doctors', intent: 'view_doctors' },
  { id: 'contact', label: 'Contact the Clinic', intent: 'view_contact' },
];

/**
 * Intelligent receptionist response generator (Frontend simulated AI)
 * Matches queries against clinic domain knowledge and returns rich card states or structured messages.
 */
export const getSimulatedResponse = (userText) => {
  const query = userText.toLowerCase().trim();

  // Booking / Appointment intents
  if (
    query.includes('book') ||
    query.includes('appointment') ||
    query.includes('schedule') ||
    query.includes('consultation') ||
    query.includes('reserve') ||
    query.includes('slot')
  ) {
    return {
      type: 'appointment_flow',
      text: "Of course! I would be delighted to help you request an appointment. Please select your preferred treatment and schedule details below:",
      quickReplies: ['View Services First', 'Clinic Hours', 'Talk to Human'],
    };
  }

  // Services intent
  if (
    query.includes('service') ||
    query.includes('treatment') ||
    query.includes('procedure') ||
    query.includes('what do you do') ||
    query.includes('offer')
  ) {
    return {
      type: 'services_list',
      text: "We offer comprehensive dental services ranging from preventive maintenance to advanced implantology and cosmetic smile transformations. Here are our primary specialties:",
      quickReplies: ['Book an Appointment', 'Meet Our Doctors', 'Clinic Hours'],
    };
  }

  // Specific treatment: Teeth Whitening / Veneers / Cosmetic
  if (
    query.includes('whiten') ||
    query.includes('veneer') ||
    query.includes('cosmetic') ||
    query.includes('smile design')
  ) {
    return {
      type: 'text',
      text: "Our Cosmetic Dentistry department specializes in Zoom™ Teeth Whitening (brightens up to 8 shades in 60 mins), custom hand-crafted Porcelain Veneers, and 3D Digital Smile Design led by Dr. Blulah Joy. Would you like to schedule an aesthetic consultation?",
      quickReplies: ['Book Consultation', 'View All Services', 'Doctor Details'],
    };
  }

  // Specific treatment: Implants / Root Canal
  if (
    query.includes('implant') ||
    query.includes('missing tooth') ||
    query.includes('root canal') ||
    query.includes('pain') ||
    query.includes('toothache')
  ) {
    return {
      type: 'text',
      text: "For restorative care, Dr. Arun Kumar leads our Dental Implant surgeries with 3D precision guides, and Dr. Nicholas handles Microscopic Root Canal Therapy for pain-free tooth preservation. If you are experiencing acute discomfort, we prioritize emergency visits.",
      quickReplies: ['Book an Appointment', 'Emergency Care', 'Clinic Location'],
    };
  }

  // Specific treatment: Braces / Invisalign
  if (
    query.includes('braces') ||
    query.includes('invisalign') ||
    query.includes('aligner') ||
    query.includes('straighten')
  ) {
    return {
      type: 'text',
      text: "We provide Invisalign® Clear Aligners and discreet ceramic aesthetic braces. You can view 3D projected outcomes of your smile before beginning treatment. Would you like to request an orthodontic scan?",
      quickReplies: ['Book an Appointment', 'Our Services', 'Clinic Hours'],
    };
  }

  // Hours intent
  if (
    query.includes('hour') ||
    query.includes('timing') ||
    query.includes('open') ||
    query.includes('close') ||
    query.includes('weekend') ||
    query.includes('sunday') ||
    query.includes('saturday')
  ) {
    return {
      type: 'clinic_hours',
      text: "Here are our clinic operating hours. We see scheduled patients throughout the week and maintain on-call specialists for urgent care:",
      quickReplies: ['Book an Appointment', 'Contact Clinic', 'Find Location'],
    };
  }

  // Doctors / Specialist intent
  if (
    query.includes('doctor') ||
    query.includes('dentist') ||
    query.includes('specialist') ||
    query.includes('team') ||
    query.includes('arun') ||
    query.includes('nicholas') ||
    query.includes('blulah')
  ) {
    return {
      type: 'doctors_list',
      text: "Our clinic is staffed by internationally recognized dental specialists with over 35 years of combined clinical excellence:",
      quickReplies: ['Book with a Specialist', 'Clinic Hours', 'Our Services'],
    };
  }

  // Location / Address intent
  if (
    query.includes('location') ||
    query.includes('where') ||
    query.includes('address') ||
    query.includes('map') ||
    query.includes('reach') ||
    query.includes('place')
  ) {
    return {
      type: 'clinic_contact',
      text: `We are located at ${CLINIC_INFO.address}. Convenient valet parking is available on premises.`,
      quickReplies: ['Book an Appointment', 'Clinic Hours', 'Call Clinic'],
    };
  }

  // Contact / Phone / Email
  if (
    query.includes('contact') ||
    query.includes('phone') ||
    query.includes('call') ||
    query.includes('number') ||
    query.includes('email')
  ) {
    return {
      type: 'clinic_contact',
      text: `You can reach our concierge desk directly at ${CLINIC_INFO.phone} or email ${CLINIC_INFO.email}. For dental emergencies outside normal hours, call ${CLINIC_INFO.emergencyPhone}.`,
      quickReplies: ['Book an Appointment', 'Clinic Hours', 'Our Services'],
    };
  }

  // Pricing / Cost
  if (
    query.includes('price') ||
    query.includes('cost') ||
    query.includes('fee') ||
    query.includes('expensive') ||
    query.includes('insurance')
  ) {
    return {
      type: 'text',
      text: "Because dental procedures are customized to each individual's anatomical needs, exact pricing is provided following your comprehensive 3D diagnostic evaluation. We offer transparent itemized treatment plans and flexible installment options.",
      quickReplies: ['Book Consultation', 'Our Services', 'Contact Clinic'],
    };
  }

  // Emergency intent
  if (
    query.includes('emergency') ||
    query.includes('urgent') ||
    query.includes('bleeding') ||
    query.includes('broken tooth') ||
    query.includes('severe pain')
  ) {
    return {
      type: 'text',
      text: `If you have an urgent dental emergency, please call our emergency hotline immediately at ${CLINIC_INFO.emergencyPhone}. Our on-call surgical team can prepare for same-day emergency triage.`,
      quickReplies: ['Contact Clinic', 'Clinic Hours', 'Book Priority Request'],
    };
  }

  // Greetings
  if (
    query.includes('hi') ||
    query.includes('hello') ||
    query.includes('hey') ||
    query.includes('good morning') ||
    query.includes('good afternoon')
  ) {
    return {
      type: 'text',
      text: "Hello! Welcome to Dental Clinic. I am your digital concierge. How may I assist you today? You can request an appointment, explore our specialized treatments, or meet our doctors.",
      quickReplies: ['Book an Appointment', 'Our Services', 'Clinic Hours', 'Meet Our Doctors'],
    };
  }

  // Default fallback response
  return {
    type: 'text',
    text: "Thank you for reaching out. I can assist you with appointment requests, service information, doctor profiles, or clinic timings. What would you like to explore?",
    quickReplies: ['Book an Appointment', 'Our Services', 'Clinic Hours', 'Contact the Clinic'],
  };
};
