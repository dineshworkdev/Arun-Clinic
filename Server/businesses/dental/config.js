/**
 * Dental Clinic Business Configuration & Knowledge Base
 * Defines all business-specific identity, staff, hours, policies, and safety rules.
 * Separated cleanly from the core AI engine.
 */

export const dentalConfig = {
  business: {
    id: "dental-clinic-coimbatore",
    name: "Dental Clinic",
    type: "dental",
    tagline: "Modern Digital Dentistry & Aesthetic Sanctuary",
    description: "A state-of-the-art private dental sanctuary combining advanced 3D diagnostics, pain-free microscopic techniques, and personalized smile artistry.",
    location: {
      address: "12/A, Nava India, Coimbatore, Tamil Nadu, India",
      landmark: "Near Nava India Signal, convenient valet parking available on-site",
      city: "Coimbatore",
      state: "Tamil Nadu",
      country: "India",
    },
    contact: {
      phone: "+91 98765 43210",
      emergencyPhone: "+91 98765 43211",
      email: "concierge@dentalclinic.com",
      website: "http://localhost:5173",
    },
    operatingHours: {
      schedule: "Monday – Friday: 8:00 AM – 6:00 PM",
      weekend: "Saturday & Sunday: Closed for routine appointments",
      emergencyAvailability: "On-call emergency triage and priority surgical care available 24/7 via the emergency hotline.",
      openHour: 8,
      closeHour: 18,
      daysOpen: [1, 2, 3, 4, 5], // Monday - Friday
      appointmentSlots: [
        "09:00 AM",
        "10:30 AM",
        "11:45 AM",
        "02:00 PM",
        "03:30 PM",
        "04:45 PM",
      ],
    },
    staff: [
      {
        id: "dr-arun-kumar",
        name: "Dr. Arun Kumar",
        title: "Lead Clinician & Specialist Implantologist",
        role: "Lead Clinician & Specialist Implantologist",
        experience: "Over 15 years of dedicated clinical experience",
        credentials: "BDS, MDS (Oral & Maxillofacial Implantology), Diplomate ICOI",
        specialties: [
          "Full-Mouth Rehabilitation",
          "Titanium & Zirconia Dental Implants",
          "Advanced Bone Grafting & Sinus Lifts",
          "All-on-4 / All-on-6 Immediate Restorations",
        ],
        availabilityDays: "Monday to Friday (Surgeries Mon/Wed/Fri, Consultations Mon-Fri)",
        bio: "Dr. Arun Kumar specializes in complex implantology and full-arch restorative rehabilitation. His precision 3D-guided surgical approach ensures unmatched functional longevity and natural aesthetic integration.",
      },
      {
        id: "dr-nicholas",
        name: "Dr. Nicholas",
        title: "Microscopic Endodontist",
        role: "Microscopic Endodontist",
        experience: "Over 12 years of specialized clinical practice",
        credentials: "BDS, MDS (Conservative Dentistry & Endodontics)",
        specialties: [
          "Microscopic Root Canal Therapy",
          "Endodontic Microsurgery",
          "Complex Natural Tooth Preservation",
          "Pain-Free Anesthetic Techniques",
        ],
        availabilityDays: "Tuesday, Thursday, Friday",
        bio: "Dr. Nicholas is a renowned expert in surgical microscopic root canal procedures. Utilizing 3D CBCT imaging and operating microscopes, he disinfected complex canal systems and preserves natural teeth painlessly.",
      },
      {
        id: "dr-blulah-joy",
        name: "Dr. Blulah Joy",
        title: "Cosmetic Dentist & Smile Architect",
        role: "Cosmetic Dentist & Smile Architect",
        experience: "Over 10 years of cosmetic smile transformation practice",
        credentials: "BDS, Fellowship in Aesthetic Dentistry (AACD)",
        specialties: [
          "Digital Smile Design (DSD)",
          "Ultra-Thin Custom Porcelain Veneers",
          "Architectural Composite Bonding",
          "Laser & In-Office Zoom Whitening",
        ],
        availabilityDays: "Monday, Tuesday, Thursday",
        bio: "Renowned for her architectural harmony approach, Dr. Blulah Joy blends fine artistry with modern dental materials. She designs custom, natural-looking smiles tailored to facial symmetry and patient goals.",
      },
    ],
    services: [
      {
        category: "General & Preventive Dentistry",
        items: [
          {
            name: "Comprehensive Exams & 3D Diagnostics",
            duration: "45 Minutes",
            description: "Full digital assessment of teeth, gums, and TMJ using low-radiation 3D CBCT scans and digital photography.",
          },
          {
            name: "Professional Hygienic Cleaning & Polishing",
            duration: "45 Minutes",
            description: "Gentle ultrasonic scaling to remove plaque and calculus, finished with Air-Flow stain polishing and fluoride shield.",
          },
          {
            name: "Tooth-Colored Composite Fillings",
            duration: "30 - 45 Minutes (Single Visit)",
            description: "Biocompatible, mercury-free nano-composite resin fillings bonded seamlessly to match your natural tooth shade.",
          },
          {
            name: "Pediatric Dentistry & Protective Sealants",
            duration: "30 Minutes",
            description: "Gentle, stress-free preventative care and fissure sealants for children to safeguard young enamel against decay.",
          },
        ],
      },
      {
        category: "Cosmetic Dentistry",
        items: [
          {
            name: "Custom Porcelain Veneers & Lumineers",
            duration: "2 to 3 Visits",
            description: "Ultra-thin, handcrafted ceramic shells bonded to front teeth to permanently correct chips, gaps, discoloration, or minor misalignment.",
          },
          {
            name: "Laser & Zoom™ Teeth Whitening",
            duration: "60 Minutes",
            description: "In-office clinical light-activated whitening system that brightens teeth up to 8 shades safely with minimal sensitivity.",
          },
          {
            name: "Architectural Composite Bonding",
            duration: "Single Visit (45 - 60 Minutes)",
            description: "Non-invasive sculpting of micro-layered resin directly onto tooth surfaces to repair minor chips and spacing.",
          },
          {
            name: "Digital Smile Design (DSD) Makeover",
            duration: "Comprehensive consultation + multi-stage plan",
            description: "Interactive 3D photorealistic preview allowing patients to co-design and preview their dream smile before treatment starts.",
          },
        ],
      },
      {
        category: "Restorative Dentistry & Implants",
        items: [
          {
            name: "Titanium & Zirconia Dental Implants",
            duration: "Multi-stage with 3D surgical guide",
            description: "Permanent bio-compatible titanium/zirconia root replacements with 99.2% success rate, preserving jawbone density.",
          },
          {
            name: "All-on-4 / All-on-6 Full Arch Restorations",
            duration: "Immediate Function / Same Day Teeth",
            description: "Full arch fixed bridge anchored to 4 or 6 strategically placed implants for patients with multiple missing teeth.",
          },
          {
            name: "Porcelain & Ceramic Crowns & Bridges",
            duration: "1 to 2 Visits (CAD/CAM Precision)",
            description: "Precision-milled monolithic zirconia or e.max porcelain crowns that restore structural chewing strength and natural translucency.",
          },
          {
            name: "Microscopic Root Canal Therapy",
            duration: "Single Visit or 2 Visits",
            description: "Painless high-precision microscopic disinfection of infected pulp to relieve pain and prevent tooth extraction.",
          },
        ],
      },
      {
        category: "Orthodontics",
        items: [
          {
            name: "Invisalign® Clear Aligners",
            duration: "Custom plan (typically 6 - 18 months)",
            description: "Discreet, removable clear aligner trays that gradually straighten teeth without wires or dietary restrictions.",
          },
          {
            name: "Ceramic & Aesthetic Braces",
            duration: "Custom plan",
            description: "Translucent tooth-colored ceramic brackets providing high mechanical control for complex orthodontic alignment.",
          },
          {
            name: "Custom Retainers & Bruxism Night Guards",
            duration: "Single impression / 3D scan",
            description: "Custom-molded protective appliances to relieve TMJ strain, prevent teeth grinding, and maintain alignment.",
          },
        ],
      },
      {
        category: "Specialty & Oral Surgery",
        items: [
          {
            name: "Wisdom Teeth & Surgical Extractions",
            duration: "45 - 60 Minutes",
            description: "Gentle surgical extraction using piezoelectric ultrasonic instruments, minimizing post-operative swelling and discomfort.",
          },
        ],
      },
    ],
    policies: {
      appointmentPolicy: "Appointments requested online or via the AI receptionist are provisional requests. The clinic concierge team will contact the patient within 2 business hours via phone or WhatsApp to confirm slot availability.",
      cancellationPolicy: "We request at least 24 hours prior notice for cancellations or rescheduling so that we can accommodate waiting patients. There is no cancellation fee when notified 24 hours in advance.",
      pricingPolicy: "Because every mouth has unique anatomical requirements, exact itemized treatment costs are provided following a comprehensive 3D diagnostic evaluation. We guarantee 100% transparent pricing with no hidden charges.",
      paymentMethods: "Cash, UPI, all major Credit/Debit cards, Net Banking, and flexible interest-free EMI financing options are available.",
      insurancePolicy: "We provide comprehensive itemized bills and clinical documentation to assist patients in claiming reimbursement from private dental health insurance providers.",
      virtualConsultation: "Available for overseas and out-of-town patients looking for preliminary aesthetic assessments and treatment planning.",
    },
    safetyRules: [
      "IDENTITY & PROFESSIONALISM: You are an AI receptionist, NOT a doctor or dentist. Do NOT pretend to be human or claim to have physical clinical hands. Maintain a warm, calm, polite, and professional healthcare concierge tone. Never be overly casual, sarcastic, or dismissive. Do NOT use emojis. Use clean, professional text formatting.",
      "ABSOLUTE KNOWLEDGE GROUNDING: Answer questions ONLY using the factual clinic information provided in the verified knowledge base. Do NOT invent, assume, or hallucinate information about doctors, treatments, operating hours, prices, or policies. If a user asks about something not covered in the knowledge base, state politely: \"I do not have those specific details in my records. Please contact our clinic concierge directly at +91 98765 43210 or concierge@dentalclinic.com, and our team will be delighted to assist you.\"",
      "MEDICAL SAFETY & NON-DIAGNOSIS DIRECTIVE: You MUST NOT diagnose dental or medical conditions under any circumstances. You MUST NOT prescribe, suggest, or recommend medications, drugs, pain relievers, antibiotics, or dosages. If a user reports symptoms (e.g. tooth pain, bleeding gums, loose teeth, sensitivity, clicking jaw): acknowledge with calm empathy, explicitly clarify that as an AI receptionist you cannot provide clinical medical diagnoses, and strongly recommend scheduling a clinical examination with one of our dental specialists (Dr. Arun Kumar, Dr. Nicholas, or Dr. Blulah Joy).",
      "EMERGENCY PROTOCOL: If the user describes an urgent emergency (uncontrolled bleeding, severe trauma, facial swelling affecting breathing, knocked-out tooth): emphasize that they need immediate professional emergency medical or dental attention, provide our 24/7 emergency hotline (+91 98765 43211), and advise that for a knocked-out permanent tooth, keeping it moist in milk or saliva and reaching the clinic within 60 minutes offers the highest chance of saving it.",
    ],
    businessRules: [
      "Operating hours are Monday to Friday, 8:00 AM – 6:00 PM. Saturday and Sunday are closed for elective care (emergency surgical care on call).",
      "Clarify that any request submitted through the website or chat is a provisional request, and the clinic concierge team will contact them within 2 business hours via phone or WhatsApp to confirm slot availability.",
    ],
  },

  // Backwards compatibility mappings for existing codebase & tests
  get clinic() {
    return {
      name: this.business.name,
      tagline: this.business.tagline,
      description: this.business.description,
      address: this.business.location.address,
      landmark: this.business.location.landmark,
      phone: this.business.contact.phone,
      emergencyPhone: this.business.contact.emergencyPhone,
      email: this.business.contact.email,
      website: this.business.contact.website,
    };
  },
  get operatingHours() {
    return this.business.operatingHours;
  },
  get doctors() {
    return this.business.staff;
  },
  get services() {
    return this.business.services;
  },
  get policies() {
    return this.business.policies;
  },
  get emergencyProtocol() {
    return {
      definition: "Dental emergencies include severe unrelenting tooth pain, swelling extending to the face or eye, uncontrolled bleeding, trauma or a completely knocked-out tooth (avulsion).",
      action: "Contact our 24/7 emergency line immediately at +91 98765 43211. For a knocked-out permanent tooth, keep it moist in cold milk or saliva and reach the clinic within 60 minutes for highest re-implantation success.",
    };
  },
  get medicalSafetyRules() {
    return {
      neverDiagnose: "Under NO circumstances diagnose conditions (e.g., do not say 'You have a periapical abscess' or 'That is gingivitis'). Say: 'While that could indicate an underlying issue, only a qualified dentist can perform an exam and provide an accurate diagnosis.'",
      neverPrescribe: "Under NO circumstances prescribe or recommend medications, painkillers, antibiotics, or dosages. Always recommend consulting a doctor or pharmacist.",
      referToProfessional: "Always direct medical concerns to a dental consultation with our clinical specialists.",
    };
  },
};

export default dentalConfig;
