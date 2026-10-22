const DAY = 86400000;
const LIMIT = 36600;

function parseDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new TypeError('Expected a civil date in YYYY-MM-DD format');
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || value.startsWith('0000-') || date.toISOString().slice(0, 10) !== value) {
    throw new RangeError('Invalid civil date');
  }
  return date;
}

function count(value) {
  if (!Number.isInteger(value) || value < 0 || value > LIMIT) {
    throw new RangeError(`Business days must be an integer from 0 to ${LIMIT}`);
  }
  return value;
}

/** Calendar arithmetic uses civil dates, never elapsed 24-hour periods. */
export function createCalendar({timeZone, workingWeekdays = [1, 2, 3, 4, 5], recurringHolidays = [], closedDates = []} = {}) {
  if (typeof timeZone !== 'string' || !timeZone) throw new TypeError('timeZone is required');
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone, era: 'short', year: 'numeric', month: '2-digit', day: '2-digit', calendar: 'gregory', numberingSystem: 'latn'
  });
  if (!Array.isArray(workingWeekdays) || !workingWeekdays.length ||
      Array.from(workingWeekdays).some(day => !Number.isInteger(day) || day < 0 || day > 6)) {
    throw new RangeError('workingWeekdays must contain integers from 0 (Sunday) to 6');
  }
  if (!Array.isArray(recurringHolidays) || !Array.isArray(closedDates)) throw new TypeError('Holidays must be arrays');
  const weekdays = new Set(workingWeekdays);
  const recurring = new Set(Array.from(recurringHolidays, value => {
    // Leap year permits an explicitly configured February 29.
    parseDate(`2000-${value}`);
    return value;
  }));
  const closed = new Set(Array.from(closedDates, value => {parseDate(value); return value;}));

  function dateAt(instant) {
    if (!(instant instanceof Date) && !(typeof instant === 'string' &&
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(instant))) {
      throw new TypeError('Expected a Date or ISO timestamp with explicit offset');
    }
    if (typeof instant === 'string') {
      parseDate(instant.slice(0, 10));
      const clock = instant.slice(11).match(/^(\d{2}):(\d{2})(?::(\d{2}))?/);
      if (+clock[1] > 23 || +clock[2] > 59 || +(clock[3] ?? 0) > 59) {
        throw new RangeError('Invalid timestamp clock');
      }
    }
    const date = instant instanceof Date ? new Date(instant.getTime()) : new Date(instant);
    if (!Number.isFinite(date.getTime())) throw new RangeError('Invalid instant');
    const parts = Object.fromEntries(formatter.formatToParts(date).map(p => [p.type, p.value]));
    const civil = `${parts.year.padStart(4, '0')}-${parts.month}-${parts.day}`;
    // Intl formats BCE years without a signed ISO year; disallow those dates.
    const year = date.getUTCFullYear();
    if (year < 1 || year > 9999 || parts.era !== 'AD') throw new RangeError('Instant year outside supported range');
    parseDate(civil);
    return civil;
  }
  function isBusinessDay(value) {
    const date = parseDate(value);
    return weekdays.has(date.getUTCDay()) && !recurring.has(value.slice(5)) && !closed.has(value);
  }
  function addBusinessDays(start, days) {
    let cursor = parseDate(start);
    count(days);
    let remaining = days;
    for (let scanned = 0; remaining > 0; scanned++) {
      if (scanned >= LIMIT) throw new RangeError('Calendar search exceeds 36600 civil days');
      cursor = new Date(cursor.getTime() + DAY);
      const civil = cursor.toISOString().slice(0, 10);
      parseDate(civil);
      if (isBusinessDay(civil)) remaining--;
    }
    return cursor.toISOString().slice(0, 10);
  }
  return Object.freeze({dateAt, isBusinessDay, addBusinessDays});
}

/** Returns null for missing ranges; malformed ranges throw instead of guessing. */
export function estimateDelivery({calendar, orderedAt, processing, shipping}) {
  if (processing == null || shipping == null) return null;
  function range(value) {
    count(value.min); count(value.max);
    if (value.min > value.max) throw new RangeError('Range min exceeds max');
    return value;
  }
  const p = range(processing), s = range(shipping);
  const orderDate = calendar.dateAt(orderedAt);
  const processingEnd = {
    earliest: calendar.addBusinessDays(orderDate, p.min),
    latest: calendar.addBusinessDays(orderDate, p.max)
  };
  return {orderDate, processingEnd, arrival: {
    earliest: calendar.addBusinessDays(processingEnd.earliest, s.min),
    latest: calendar.addBusinessDays(processingEnd.latest, s.max)
  }};
}
