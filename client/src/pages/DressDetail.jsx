import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDress, getReservedDates } from '../api/services';
import CalendarView from '../components/CalendarView';
import ReservationForm from '../components/ReservationForm';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { FALLBACK_IMG, onImgError } from '../utils/image';

// Dress detail page: image gallery + per-dress availability calendar +
// reservation form. The calendar and form share `reservedDates` so the
// real-time availability guard is consistent.
export default function DressDetail() {
  const { id } = useParams();
  const [dress, setDress] = useState(null);
  const [reservedDates, setReservedDates] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [range, setRange] = useState(null); // [startDate, endDate]
  const [rangeError, setRangeError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([getDress(id), getReservedDates(id)])
      .then(([d, dates]) => {
        setDress(d);
        setReservedDates(dates);
      })
      .catch(() => setError('Could not load this dress.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  // Range selection from the calendar; reject spans crossing reserved days.
  const handleSelectRange = (picked, reason) => {
    if (reason === 'crosses') {
      setRange(null);
      setRangeError('Your selected period includes an unavailable day. Pick a clear range.');
      return;
    }
    setRangeError('');
    setRange(picked);
  };

  // After a successful reservation, refetch reserved dates so the
  // calendar immediately reflects the new booking (and its buffer).
  const handleSuccess = () => {
    setRange(null);
    getReservedDates(id).then(setReservedDates).catch(() => {});
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;
  if (!dress) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/gallery" className="text-sm text-rosegold-600 hover:underline">
        ← Back to gallery
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Image gallery */}
        <div className="animate-scale-in">
          <div className="card overflow-hidden">
            <img
              key={activeImage}
              src={dress.images?.[activeImage] || FALLBACK_IMG}
              alt={dress.name}
              onError={onImgError}
              className="aspect-[3/4] w-full animate-fade-in object-cover"
            />
          </div>
          {dress.images?.length > 1 && (
            <div className="mt-3 flex gap-3">
              {dress.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-16 overflow-hidden rounded-lg border-2 transition ${
                    i === activeImage ? 'border-rosegold-500' : 'border-transparent'
                  }`}
                >
                  <img src={src} alt="" onError={onImgError} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <span className="badge bg-rosegold-100 capitalize text-rosegold-700">
            {dress.category}
          </span>
          <h1 className="mt-3 font-heading text-4xl text-charcoal">{dress.name}</h1>
          <p className="mt-4 text-charcoal-light">{dress.description}</p>
          <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-2">
            <div className="text-3xl font-semibold text-rosegold-600">
              {dress.pricePerDay} TND
              <span className="text-base font-normal text-charcoal-light"> / day</span>
            </div>
            {dress.deposit > 0 && (
              <div className="text-sm text-charcoal-light">
                Refundable deposit:{' '}
                <strong className="text-charcoal">{dress.deposit} TND</strong>
              </div>
            )}
          </div>

          {/* Available sizes */}
          {dress.sizes?.length > 0 && (
            <div className="mt-4">
              <p className="label">Available sizes</p>
              <div className="flex flex-wrap gap-2">
                {dress.sizes.map((s) => (
                  <span key={s} className="badge border border-rosegold-200 bg-white text-charcoal">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!dress.available && (
            <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
              This dress is currently not available for rental.
            </p>
          )}

          {/* Per-dress availability calendar (range selection) */}
          <div className="mt-8">
            <h2 className="mb-1 font-heading text-2xl text-charcoal">Availability</h2>
            <p className="mb-3 text-sm text-charcoal-light">
              Click your <strong>start</strong> date, then your <strong>return</strong> date.
              A {dress.deposit >= 0 ? 'cleaning' : ''} buffer between rentals is shown as reserved.
            </p>
            {rangeError && (
              <p className="mb-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{rangeError}</p>
            )}
            <CalendarView
              reservedDates={reservedDates}
              value={range}
              selectRange
              onSelectRange={handleSelectRange}
              selectable={dress.available}
            />
          </div>
        </div>
      </div>

      {/* Reservation form */}
      <div className="mt-12 lg:max-w-2xl">
        <ReservationForm
          dress={dress}
          range={range}
          reservedDates={reservedDates}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
