/**
 * Date Resolver Utility
 * Generic relative date parser converting terms like "today", "tomorrow",
 * "this Friday", "next Monday" to YYYY-MM-DD.
 */

export function resolveRelativeDate(inputDateStr, baseDate = new Date()) {
  if (!inputDateStr || typeof inputDateStr !== 'string') {
    return baseDate.toISOString().split('T')[0];
  }

  const str = inputDateStr.toLowerCase().trim();

  // If already YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  const result = new Date(baseDate);

  if (str === 'today') {
    return result.toISOString().split('T')[0];
  }

  if (str === 'tomorrow') {
    result.setDate(result.getDate() + 1);
    return result.toISOString().split('T')[0];
  }

  if (str === 'day after tomorrow') {
    result.setDate(result.getDate() + 2);
    return result.toISOString().split('T')[0];
  }

  // Handle weekday names: "friday", "this friday", "next monday"
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayIndex = days.findIndex(d => str.includes(d));

  if (dayIndex !== -1) {
    const currentDay = result.getDay();
    let diff = dayIndex - currentDay;
    if (diff <= 0 || str.includes('next')) {
      diff += 7;
    }
    result.setDate(result.getDate() + diff);
    return result.toISOString().split('T')[0];
  }

  // Fallback: try Date.parse
  const parsed = new Date(inputDateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  // Default to tomorrow if ambiguous
  result.setDate(result.getDate() + 1);
  return result.toISOString().split('T')[0];
}

export function getCurrentServerDateInfo(baseDate = new Date()) {
  const dateStr = baseDate.toISOString().split('T')[0];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[baseDate.getDay()];
  const timeStr = baseDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return {
    date: dateStr,
    dayName,
    time: timeStr,
  };
}
