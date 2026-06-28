const {
  startOfDayUTC,
  toISODate,
  addDaysUTC,
  daysInclusive,
  eachDayISO,
} = require('../utils/date');

describe('date utils', () => {
  test('startOfDayUTC normalises to midnight UTC', () => {
    expect(startOfDayUTC('2026-07-04T15:30:00Z').toISOString()).toBe(
      '2026-07-04T00:00:00.000Z'
    );
  });

  test('startOfDayUTC returns null for invalid input', () => {
    expect(startOfDayUTC('not-a-date')).toBeNull();
  });

  test('toISODate formats YYYY-MM-DD', () => {
    expect(toISODate('2026-07-04T23:00:00Z')).toBe('2026-07-04');
  });

  test('addDaysUTC adds and subtracts days', () => {
    expect(toISODate(addDaysUTC('2026-07-04', 3))).toBe('2026-07-07');
    expect(toISODate(addDaysUTC('2026-07-04', -1))).toBe('2026-07-03');
  });

  test('daysInclusive counts the range inclusively', () => {
    expect(daysInclusive('2026-07-04', '2026-07-04')).toBe(1);
    expect(daysInclusive('2026-07-04', '2026-07-06')).toBe(3);
  });

  test('eachDayISO lists every day inclusively', () => {
    expect(eachDayISO('2026-07-04', '2026-07-06')).toEqual([
      '2026-07-04',
      '2026-07-05',
      '2026-07-06',
    ]);
  });
});
