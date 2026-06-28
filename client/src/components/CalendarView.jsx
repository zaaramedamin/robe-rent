import Calendar from 'react-calendar';
import { toISODate, isPast, eachDay } from '../utils/date';

/**
 * Reusable availability calendar (built on react-calendar).
 *
 * Props:
 *  - reservedDates: string[]  -> YYYY-MM-DD days that are unavailable
 *  - value:         Date | [Date, Date] | null -> current selection
 *  - onSelectDate:  (Date)        -> single-day mode callback
 *  - onSelectRange: ([start,end]) -> range mode callback (both days picked)
 *  - selectRange:   boolean       -> enable start→end range selection
 *  - selectable:    boolean       -> if false, calendar is display-only
 *
 * Calendar logic:
 *  - Past days are disabled.
 *  - Reserved days (rental range + cleaning buffer) are red and disabled.
 *  - In range mode, react-calendar highlights the chosen span; we also
 *    reject a span that would cross a reserved day (validated here and,
 *    authoritatively, on the backend).
 */
export default function CalendarView({
  reservedDates = [],
  value = null,
  onSelectDate,
  onSelectRange,
  selectRange = false,
  selectable = true,
}) {
  const reservedSet = new Set(reservedDates);
  const isReserved = (date) => reservedSet.has(toISODate(date));

  // Color reserved (future) days red.
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    if (isPast(date)) return null;
    return isReserved(date) ? 'cal-reserved' : 'cal-available';
  };

  // Disable past days and reserved days.
  const tileDisabled = ({ date, view }) => {
    if (view !== 'month') return false;
    if (isPast(date)) return true;
    return selectable && isReserved(date);
  };

  // Normalise "today" to midnight so today stays selectable.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Handle a completed selection.
  const handleChange = (val) => {
    if (!selectable) return;
    if (selectRange) {
      // react-calendar returns [start, end] once both ends are picked.
      if (Array.isArray(val) && val[0] && val[1]) {
        // Guard: reject a range that spans any reserved day.
        const crosses = eachDay(val[0], val[1]).some((d) => reservedSet.has(d));
        if (crosses) {
          onSelectRange?.(null, 'crosses');
          return;
        }
        onSelectRange?.([val[0], val[1]]);
      }
    } else if (val) {
      onSelectDate?.(val);
    }
  };

  return (
    <div className="card p-5 sm:p-7">
      <Calendar
        selectRange={selectRange}
        onChange={handleChange}
        value={value}
        tileClassName={tileClassName}
        tileDisabled={tileDisabled}
        minDate={today}
        showNeighboringMonth={false}
        prev2Label={null}
        next2Label={null}
      />

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-charcoal-light">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-[#e7f6ec] ring-1 ring-green-300" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-[#fde2e2] ring-1 ring-red-300" />
          Reserved
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-rosegold-500" />
          {selectRange ? 'Selected range' : 'Selected'}
        </span>
      </div>
    </div>
  );
}
