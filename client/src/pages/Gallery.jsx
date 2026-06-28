import { useEffect, useMemo, useState } from 'react';
import { getDresses, getReservedDates } from '../api/services';
import DressCard from '../components/DressCard';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { toISODate } from '../utils/date';

const categories = ['all', 'classic', 'modern', 'oriental'];

// Public gallery with search + category + price + date-availability filters.
export default function Gallery() {
  const [dresses, setDresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');
  const [availableOn, setAvailableOn] = useState('');

  // Set of dress ids that are unavailable on `availableOn` (computed lazily).
  const [unavailableIds, setUnavailableIds] = useState(null);
  const [checkingDate, setCheckingDate] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    getDresses()
      .then(setDresses)
      .catch(() => setError('Could not load dresses. Is the server running?'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // When the user picks a date, check each dress's reserved dates and
  // build the set of dresses that are booked on that day.
  useEffect(() => {
    if (!availableOn) {
      setUnavailableIds(null);
      return;
    }
    let cancelled = false;
    setCheckingDate(true);
    Promise.all(
      dresses.map((d) =>
        getReservedDates(d._id)
          .then((dates) => ({ id: d._id, taken: dates.includes(availableOn) }))
          .catch(() => ({ id: d._id, taken: false }))
      )
    ).then((results) => {
      if (cancelled) return;
      setUnavailableIds(new Set(results.filter((r) => r.taken).map((r) => r.id)));
      setCheckingDate(false);
    });
    return () => {
      cancelled = true;
    };
  }, [availableOn, dresses]);

  // Apply all filters client-side.
  const filtered = useMemo(() => {
    return dresses.filter((d) => {
      if (category !== 'all' && d.category !== category) return false;
      if (maxPrice && d.pricePerDay > Number(maxPrice)) return false;
      if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (availableOn && unavailableIds && unavailableIds.has(d._id)) return false;
      return true;
    });
  }, [dresses, category, maxPrice, search, availableOn, unavailableIds]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-heading text-4xl text-charcoal">The Collection</h1>
      <p className="mt-2 text-charcoal-light">
        Filter by style, budget, or a specific date.
      </p>

      {/* Filters */}
      <div className="card mt-6 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="label">Search</label>
          <input
            className="input"
            placeholder="Dress name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Category</label>
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c} className="capitalize">
                {c[0].toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Max price (TND/day)</label>
          <input
            type="number"
            min="0"
            className="input"
            placeholder="Any"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Available on</label>
          <input
            type="date"
            className="input"
            min={toISODate(new Date())}
            value={availableOn}
            onChange={(e) => setAvailableOn(e.target.value)}
          />
        </div>
      </div>

      {availableOn && (
        <p className="mt-3 text-sm text-charcoal-light">
          {checkingDate
            ? 'Checking availability…'
            : `Showing dresses free on ${availableOn}.`}{' '}
          <button
            className="text-rosegold-600 hover:underline"
            onClick={() => setAvailableOn('')}
          >
            clear date
          </button>
        </p>
      )}

      {/* Results */}
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-charcoal-light">
          No dresses match your filters.
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d, i) => (
            <DressCard key={d._id} dress={d} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
