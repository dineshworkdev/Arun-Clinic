/**
 * Generic check_availability Tool
 * Checks schedule availability for a staff member / specialist across any business type.
 * Supports flexible parameter aliasing (staffMember / doctor) and config-driven operating hours.
 */

/**
 * Standard Staff/Doctor Name Normalization
 */
function resolveStaffMember(inputName, staffList = []) {
  if (!inputName || typeof inputName !== 'string') return null;
  const clean = inputName.toLowerCase().trim().replace(/^(dr\.?|doctor|mr\.?|ms\.?|mrs\.?)\s+/i, '');

  for (const member of staffList) {
    const memberClean = member.name.toLowerCase().replace(/^(dr\.?|doctor|mr\.?|ms\.?|mrs\.?)\s+/i, '');
    if (memberClean.includes(clean) || clean.includes(memberClean) || member.name.toLowerCase().includes(clean)) {
      return member;
    }
  }
  return null;
}

/**
 * Parse and normalize time string (e.g., "5 PM", "5:00 PM", "17:00", "5pm")
 */
function parseTime(timeStr, openHour = 8, closeHour = 18) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const clean = timeStr.trim().toLowerCase();

  const match12 = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (match12) {
    let hour = parseInt(match12[1], 10);
    const minute = match12[2] ? parseInt(match12[2], 10) : 0;
    const meridian = match12[3];

    if (meridian === 'pm' && hour < 12) hour += 12;
    if (meridian === 'am' && hour === 12) hour = 0;

    const displayMeridian = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const displayMinute = minute < 10 ? `0${minute}` : `${minute}`;

    const isWithinHours = hour >= openHour && (hour < closeHour || (hour === closeHour && minute === 0));

    return {
      hour24: hour,
      minute,
      formatted: `${displayHour}:${displayMinute} ${displayMeridian}`,
      isWithinHours,
    };
  }

  return {
    hour24: 10,
    minute: 0,
    formatted: timeStr,
    isWithinHours: true,
  };
}

/**
 * Default mock booked slots
 */
const DEFAULT_BOOKED_SLOTS = new Set([
  '2026-10-08_dr-arun-kumar_10:30 am',
  '2026-10-08_dr-arun-kumar_02:00 pm',
  '2026-10-09_dr-nicholas_09:00 am',
  '2026-10-09_dr-nicholas_11:45 am',
  '2026-10-08_dr-blulah-joy_03:30 pm',
  '2026-10-12_dr-arun-kumar_09:00 am',
]);

/**
 * Factory function to create check_availability tool for a given business configuration
 */
export function createCheckAvailabilityTool(defaultBusinessConfig = null) {
  return {
    name: 'check_availability',
    description: 'Checks appointment slot availability for a specific staff member or specialist on a given date and time.',
    parameters: {
      type: 'object',
      properties: {
        staffMember: {
          type: 'string',
          description: 'The full or partial name of the staff member or specialist (e.g., "Dr. Arun Kumar", "Dr. Nicholas", or stylist/practitioner name).',
        },
        doctor: {
          type: 'string',
          description: 'Alias for staffMember (supported for backward compatibility).',
        },
        date: {
          type: 'string',
          description: 'The target date for the appointment in YYYY-MM-DD format (or ISO date string).',
        },
        time: {
          type: 'string',
          description: 'The preferred time of day (e.g., "5:00 PM", "10:30 AM", "2 PM").',
        },
      },
      required: ['date', 'time'],
    },

    /**
     * Execute availability check with validation against business config
     */
    async execute(args = {}, context = {}) {
      const config = context.businessConfig || defaultBusinessConfig || {};
      const business = config.business || {};
      const staffList = business.staff || config.doctors || [];
      const operatingHours = business.operatingHours || config.operatingHours || {};
      const bookedSlots = context.bookedSlots || config.bookedSlots || DEFAULT_BOOKED_SLOTS;

      const inputStaff = args.staffMember || args.doctor;
      const { date, time } = args;

      // 1. Argument validation
      if (!inputStaff || typeof inputStaff !== 'string' || !inputStaff.trim()) {
        return {
          available: false,
          staffMember: inputStaff || 'Unknown',
          doctor: inputStaff || 'Unknown',
          date: date || 'Unknown',
          time: time || 'Unknown',
          error: 'INVALID_ARGUMENT',
          message: 'Staff member name is required to check availability.',
        };
      }

      if (!date || typeof date !== 'string' || !date.trim()) {
        return {
          available: false,
          staffMember: inputStaff,
          doctor: inputStaff,
          date: date || 'Unknown',
          time: time || 'Unknown',
          error: 'INVALID_ARGUMENT',
          message: 'A valid date (YYYY-MM-DD) is required to check availability.',
        };
      }

      if (!time || typeof time !== 'string' || !time.trim()) {
        return {
          available: false,
          staffMember: inputStaff,
          doctor: inputStaff,
          date,
          time: time || 'Unknown',
          error: 'INVALID_ARGUMENT',
          message: 'A valid appointment time is required to check availability.',
        };
      }

      // 2. Staff existence check
      const matchedMember = resolveStaffMember(inputStaff, staffList);
      if (!matchedMember) {
        const knownStaff = staffList.map((s) => s.name).join(', ');
        return {
          available: false,
          staffMember: inputStaff,
          doctor: inputStaff,
          date,
          time,
          error: 'UNKNOWN_DOCTOR', // Retained error code for contract & test compatibility
          message: `Doctor "${inputStaff}" was not found in our clinic roster. Our registered specialists are: ${knownStaff}.`,
        };
      }

      // 3. Date validation & Day of week
      const targetDate = new Date(date);
      if (isNaN(targetDate.getTime())) {
        return {
          available: false,
          staffMember: matchedMember.name,
          doctor: matchedMember.name,
          date,
          time,
          error: 'INVALID_DATE',
          message: `Date "${date}" is not a valid calendar date format. Please provide a standard date like YYYY-MM-DD.`,
        };
      }

      const dayOfWeekIndex = targetDate.getDay(); // 0 = Sunday, 6 = Saturday
      const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = daysMap[dayOfWeekIndex];

      // Check business weekend/operating closure
      const daysOpen = operatingHours.daysOpen || [1, 2, 3, 4, 5]; // Default Mon-Fri
      if (!daysOpen.includes(dayOfWeekIndex)) {
        const businessName = business.name || 'Our business';
        const emergencyNotice = business.contact?.emergencyPhone
          ? ` Emergency on-call triage is available at ${business.contact.emergencyPhone}.`
          : '';
        return {
          available: false,
          staffMember: matchedMember.name,
          doctor: matchedMember.name,
          date,
          time,
          message: `${businessName} is closed on weekends (${dayName}s) for routine elective appointments. Our standard hours are Monday to Friday, 8:00 AM to 6:00 PM.${emergencyNotice}`,
        };
      }

      // Check staff member's scheduled working days
      if (matchedMember.availabilityDays) {
        const availDays = matchedMember.availabilityDays.toLowerCase();
        const isScheduledDay =
          availDays.includes('monday to friday') ||
          availDays.includes('mon-fri') ||
          availDays.includes(dayName.toLowerCase());

        if (!isScheduledDay) {
          return {
            available: false,
            staffMember: matchedMember.name,
            doctor: matchedMember.name,
            date,
            time,
            message: `${matchedMember.name} does not have clinical hours on ${dayName}s. Their regular schedule is: ${matchedMember.availabilityDays}.`,
          };
        }
      }

      // 4. Time format & Business hours check
      const openHour = operatingHours.openHour ?? 8;
      const closeHour = operatingHours.closeHour ?? 18;
      const parsedTime = parseTime(time, openHour, closeHour);

      if (!parsedTime.isWithinHours) {
        return {
          available: false,
          staffMember: matchedMember.name,
          doctor: matchedMember.name,
          date,
          time,
          message: `The requested time (${time}) falls outside clinic operating hours. We see patients Monday through Friday between 8:00 AM and 6:00 PM.`,
        };
      }

      // 5. Mock booked availability lookup
      const memberKey = matchedMember.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const slotKey = `${date.trim()}_${memberKey}_${parsedTime.formatted.toLowerCase()}`;

      if (bookedSlots.has(slotKey)) {
        return {
          available: false,
          staffMember: matchedMember.name,
          doctor: matchedMember.name,
          date,
          time: parsedTime.formatted,
          message: `${matchedMember.name} is already fully booked at ${parsedTime.formatted} on ${date} (${dayName}). Alternative available slots on that day: 03:30 PM, 05:00 PM.`,
        };
      }

      // 6. Slot available
      return {
        available: true,
        staffMember: matchedMember.name,
        doctor: matchedMember.name,
        date,
        time: parsedTime.formatted,
        message: `${matchedMember.name} is available on ${date} (${dayName}) at ${parsedTime.formatted}.`,
      };
    },
  };
}

export default createCheckAvailabilityTool;
