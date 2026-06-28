// Client-side date helpers. We mirror the server's "day granularity"
// approach: a date is identified by its YYYY-MM-DD string (local time),
// which is what the user sees and selects on the calendar.

/** Format a Date as YYYY-MM-DD using the local calendar day. */
export function toISODate(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Human-friendly date, e.g. "4 July 2026". */
export function prettyDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** True if the given date is before today (used to disable past days). */
export function isPast(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(date) < today;
}

/** Inclusive number of days between two dates. */
export function daysInclusive(start, end) {
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const e = new Date(end);
  e.setHours(0, 0, 0, 0);
  return Math.round((e - s) / 86400000) + 1;
}

/** Array of YYYY-MM-DD strings for every day in [start, end] inclusive. */
export function eachDay(start, end) {
  const out = [];
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setHours(0, 0, 0, 0);
  while (cur <= last) {
    out.push(toISODate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

/** Pretty date range, e.g. "12 – 15 Jul 2026" or a single day. */
export function prettyRange(start, end) {
  if (!end || toISODate(start) === toISODate(end)) return prettyDate(start);
  return `${prettyDate(start)} – ${prettyDate(end)}`;
}
