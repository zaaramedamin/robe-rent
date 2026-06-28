import { useState } from 'react';
import { createReservation } from '../api/services';
import { prettyRange, toISODate, daysInclusive, eachDay } from '../utils/date';

/**
 * Pre-reservation form for a date range.
 *
 * Props:
 *  - dress:        the dress being reserved
 *  - range:        [startDate, endDate] selected from the calendar (or null)
 *  - reservedDates: string[] used for the frontend availability guard
 *  - onSuccess:    (reservation) refreshes the calendar in the parent
 *
 * Availability is checked twice: here on the frontend for instant UX,
 * and again on the backend (the source of truth) when POSTing.
 */
export default function ReservationForm({
  dress,
  range,
  reservedDates = [],
  onSuccess,
}) {
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    notes: '',
    size: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const [start, end] = range || [];
  const days = start ? daysInclusive(start, end || start) : 0;
  const subtotal = days * dress.pricePerDay;

  // Frontend guard: does the selected range include any reserved day?
  const rangeTaken =
    start && eachDay(start, end || start).some((d) => reservedDates.includes(d));

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!start) {
      setError('Please select your rental dates on the calendar first.');
      return;
    }
    if (rangeTaken) {
      setError(
        'Your selected dates include an unavailable (red) day. Please pick a clear period.'
      );
      return;
    }
    if (dress.sizes?.length && !form.size) {
      setError('Please choose a size.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createReservation({
        dressId: dress._id,
        ...form,
        startDate: toISODate(start),
        endDate: toISODate(end || start),
      });
      setSuccess(res.reservation);
      setForm({ customerName: '', phone: '', email: '', notes: '', size: '' });
      onSuccess?.(res.reservation);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not submit your reservation. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ----- Success state -----
  if (success) {
    return (
      <div className="card border border-green-200 bg-green-50 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-heading text-xl text-charcoal">Reservation received!</h3>
        <p className="mt-2 text-sm text-charcoal-light">
          Thank you, {success.customerName}. We've pre-reserved{' '}
          <strong>{dress.name}</strong> for{' '}
          <strong>{prettyRange(success.startDate, success.endDate)}</strong>
          {success.rentalDays > 1 ? ` (${success.rentalDays} days)` : ''}. Our team
          will contact you shortly to confirm.
        </p>
        <button onClick={() => setSuccess(null)} className="btn-outline mt-5">
          Make another reservation
        </button>
      </div>
    );
  }

  // ----- Form state -----
  return (
    <form onSubmit={handleSubmit} className="card p-6">
      <h3 className="font-heading text-2xl text-charcoal">Pre-reserve this dress</h3>

      {/* Selected range summary */}
      <div className="mt-4 rounded-lg bg-ivory-200 px-4 py-3 text-sm">
        {start ? (
          <div className="space-y-1">
            <div>
              Dates:{' '}
              <strong className={rangeTaken ? 'text-red-600' : 'text-green-700'}>
                {prettyRange(start, end || start)}
              </strong>{' '}
              <span className="text-charcoal-light">({days} day{days === 1 ? '' : 's'})</span>
            </div>
            <div className="flex flex-wrap gap-x-4 text-charcoal-light">
              <span>Rental: <strong className="text-charcoal">{subtotal} TND</strong></span>
              {dress.deposit > 0 && (
                <span>Refundable deposit: <strong className="text-charcoal">{dress.deposit} TND</strong></span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-charcoal-light">
            Pick your start and end dates on the calendar above.
          </span>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 space-y-4">
        <div>
          <label className="label" htmlFor="customerName">Full name</label>
          <input id="customerName" name="customerName" className="input" value={form.customerName} onChange={handleChange} required placeholder="e.g. Amira Ben Salah" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="phone">Phone number</label>
            <input id="phone" name="phone" className="input" value={form.phone} onChange={handleChange} required placeholder="+216 ..." />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className="input" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="dressName">Selected dress</label>
            <input id="dressName" className="input bg-ivory-200" value={dress.name} readOnly />
          </div>
          {dress.sizes?.length > 0 && (
            <div>
              <label className="label" htmlFor="size">Size</label>
              <select id="size" name="size" className="input" value={form.size} onChange={handleChange} required>
                <option value="">Choose a size…</option>
                {dress.sizes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="label" htmlFor="notes">Notes (optional)</label>
          <textarea id="notes" name="notes" rows={3} className="input resize-none" value={form.notes} onChange={handleChange} placeholder="Alterations, fitting preferences, etc." />
        </div>
      </div>

      <button type="submit" className="btn-primary mt-6 w-full" disabled={submitting || !start || rangeTaken}>
        {submitting ? 'Submitting…' : 'Confirm pre-reservation'}
      </button>
    </form>
  );
}
