import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import { getDresses, getReservedDates } from '../api/services';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { toISODate, prettyDate, isPast } from '../utils/date';
import { useT } from '../i18n/LanguageContext';

// Global availability calendar. Builds a map of day -> set of reserved
// dress ids from every dress's reserved dates, then lets the visitor
// click any day to see which dresses are reserved vs free.
export default function CalendarPage() {
  const { t } = useT();
  const [dresses, setDresses] = useState([]);
  // Map<YYYY-MM-DD, Set<dressId>>
  const [reservedMap, setReservedMap] = useState(new Map());
  const [selected, setSelected] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    getDresses()
      .then(async (allDresses) => {
        setDresses(allDresses);
        // Fetch reserved dates for every dress in parallel.
        const results = await Promise.all(
          allDresses.map((d) =>
            getReservedDates(d._id)
              .then((dates) => ({ id: d._id, dates }))
              .catch(() => ({ id: d._id, dates: [] }))
          )
        );
        const map = new Map();
        for (const { id, dates } of results) {
          for (const day of dates) {
            if (!map.has(day)) map.set(day, new Set());
            map.get(day).add(id);
          }
        }
        setReservedMap(map);
      })
      .catch(() => setError(t('cal.loadError')))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // For the selected day, split dresses into reserved / free.
  const { reserved, free } = useMemo(() => {
    const key = toISODate(selected);
    const reservedSet = reservedMap.get(key) || new Set();
    return {
      reserved: dresses.filter((d) => reservedSet.has(d._id)),
      free: dresses.filter((d) => !reservedSet.has(d._id)),
    };
  }, [selected, reservedMap, dresses]);

  // Tint days that have any reservation.
  const tileClassName = ({ date, view }) => {
    if (view !== 'month' || isPast(date)) return null;
    return reservedMap.has(toISODate(date)) ? 'cal-reserved' : 'cal-available';
  };

  if (loading) return <Spinner label={t('cal.loading')} />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-heading text-4xl text-charcoal">{t('cal.title')}</h1>
      <p className="mt-2 text-charcoal-light">{t('cal.subtitle')}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="card p-4 sm:p-6">
          <Calendar
            onClickDay={setSelected}
            value={selected}
            tileClassName={tileClassName}
            minDate={new Date()}
            showNeighboringMonth={false}
            prev2Label={null}
            next2Label={null}
          />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded bg-[#e7f6ec] ring-1 ring-green-300" />
              {t('cal.fullyAvailable')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded bg-[#fde2e2] ring-1 ring-red-300" />
              {t('cal.hasReservations')}
            </span>
          </div>
        </div>

        {/* Day breakdown */}
        <div>
          <h2 className="font-heading text-2xl text-charcoal">{prettyDate(selected)}</h2>

          <div className="mt-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-red-600">
              {t('cal.reserved', { count: reserved.length })}
            </h3>
            {reserved.length === 0 ? (
              <p className="text-sm text-charcoal-light">{t('cal.noReservations')}</p>
            ) : (
              <ul className="space-y-2">
                {reserved.map((d) => (
                  <li
                    key={d._id}
                    className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-2 text-sm"
                  >
                    <span>{d.name}</span>
                    <Link to={`/dresses/${d._id}`} className="text-rosegold-600 hover:underline">
                      {t('cal.view')}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-green-700">
              {t('cal.available', { count: free.length })}
            </h3>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {free.map((d) => (
                <li key={d._id}>
                  <Link
                    to={`/dresses/${d._id}`}
                    className="flex items-center justify-between rounded-lg bg-green-50 px-4 py-2 text-sm hover:bg-green-100"
                  >
                    <span>{d.name}</span>
                    <span className="text-rosegold-600">{t('cal.reserveArrow')}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
