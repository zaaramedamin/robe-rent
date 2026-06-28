/**
 * Date helpers shared across routes.
 *
 * Availability is tracked at day granularity. To make comparisons
 * reliable regardless of the time portion a client sends, every
 * reservation date is normalised to midnight UTC. Two reservations on
 * the "same day" therefore have exactly equal Date values.
 */

/** Normalise any date-ish input to 00:00:00.000 UTC for that calendar day. */
function startOfDayUTC(input) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Format a Date as a YYYY-MM-DD string (UTC). */
function toISODate(date) {
  return startOfDayUTC(date).toISOString().slice(0, 10);
}

/** Return a new Date n days from the given date (midnight UTC). */
function addDaysUTC(date, n) {
  const d = startOfDayUTC(date);
  d.setUTCDate(d.getUTCDate() + n);
  return d;
}

/** Inclusive number of calendar days in [start, end]. */
function daysInclusive(start, end) {
  const s = startOfDayUTC(start);
  const e = startOfDayUTC(end);
  return Math.round((e - s) / 86400000) + 1;
}

/** Array of YYYY-MM-DD strings for every day in [start, end] inclusive. */
function eachDayISO(start, end) {
  const days = [];
  let cur = startOfDayUTC(start);
  const last = startOfDayUTC(end);
  while (cur <= last) {
    days.push(cur.toISOString().slice(0, 10));
    cur = addDaysUTC(cur, 1);
  }
  return days;
}

module.exports = {
  startOfDayUTC,
  toISODate,
  addDaysUTC,
  daysInclusive,
  eachDayISO,
};
