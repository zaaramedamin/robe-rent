import { useState } from 'react';
import { createReservation } from '../api/services';
import { prettyRange, toISODate, daysInclusive, eachDay } from '../utils/date';
import { validateName, validateEmail, validatePhone } from '../utils/validation';
import { useT } from '../i18n/LanguageContext';

/**
 * Pre-reservation form for a date range.
 *
 * Props:
 *  - dress:        the dress being reserved
 *  - range:        [startDate, endDate] selected from the calendar (or null)
 *  - reservedDates: string[] used for the frontend availability guard
 *  - onSuccess:    (reservation) refreshes the calendar in the parent
 *
 * Validation runs on the client for instant, per-field feedback, then the
 * backend (the source of truth) re-validates and re-checks availability.
 */

// Per-field validators keyed by input name. Each returns a translation key.
const VALIDATORS = {
  customerName: validateName,
  email: validateEmail,
  phone: validatePhone,
};

export default function ReservationForm({
  dress,
  range,
  reservedDates = [],
  onSuccess,
}) {
  const { t } = useT();
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    notes: '',
    size: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(''); // a translation key or backend message
  const [success, setSuccess] = useState(null);

  const [start, end] = range || [];
  const days = start ? daysInclusive(start, end || start) : 0;
  const subtotal = days * dress.pricePerDay;
  const dayUnit = (n) => t(n === 1 ? 'unit.day' : 'unit.days');

  // Frontend guard: does the selected range include any reserved day?
  const rangeTaken =
    start && eachDay(start, end || start).some((d) => reservedDates.includes(d));

  const validateField = (name, value) =>
    VALIDATORS[name] ? VALIDATORS[name](value) : '';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const validateAll = () => {
    const errs = {};
    for (const name of Object.keys(VALIDATORS)) {
      const key = validateField(name, form[name]);
      if (key) errs[name] = key;
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 1 — validate everything, then show the review panel.
  const handleReview = (e) => {
    e.preventDefault();
    setError('');
    if (!start) {
      setError('res.pickDatesFirst');
      return;
    }
    if (rangeTaken) {
      setError('res.rangeTaken');
      return;
    }
    if (dress.sizes?.length && !form.size) {
      setError('res.chooseSize');
      return;
    }
    if (!validateAll()) {
      setError('res.fixFields');
      return;
    }
    setConfirming(true);
  };

  // Step 2 — send the reservation to the backend.
  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await createReservation({
        dressId: dress._id,
        ...form,
        startDate: toISODate(start),
        endDate: toISODate(end || start),
      });
      setSuccess(res.reservation);
      setForm({ customerName: '', phone: '', email: '', notes: '', size: '' });
      setConfirming(false);
      onSuccess?.(res.reservation);
    } catch (err) {
      setConfirming(false);
      setError(err.response?.data?.message || 'res.submitError');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldProps = (name) => ({
    name,
    value: form[name],
    onChange: handleChange,
    onBlur: handleBlur,
    'aria-invalid': Boolean(fieldErrors[name]),
    'aria-describedby': fieldErrors[name] ? `${name}-error` : undefined,
  });

  const FieldError = ({ name }) =>
    fieldErrors[name] ? (
      <p id={`${name}-error`} role="alert" className="mt-1 text-xs text-red-600">
        {t(fieldErrors[name])}
      </p>
    ) : null;

  // ----- Success state -----
  if (success) {
    const daysSuffix =
      success.rentalDays > 1 ? ` (${success.rentalDays} ${t('unit.days')})` : '';
    return (
      <div className="card border border-green-200 bg-green-50 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-heading text-xl text-charcoal">{t('res.received')}</h3>
        <p className="mt-2 text-sm text-charcoal-light">
          {t('res.thankYou', {
            name: success.customerName,
            dress: dress.name,
            range: prettyRange(success.startDate, success.endDate),
            days: daysSuffix,
          })}
        </p>
        <div className="mx-auto mt-4 max-w-sm rounded-lg bg-white/70 p-4 text-left text-sm text-charcoal-light">
          <p className="font-medium text-charcoal">{t('res.nextTitle')}</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>{t('res.next1')}</li>
            <li>{t('res.next2', { email: success.email, phone: success.phone })}</li>
            <li>{t('res.next3')}</li>
          </ol>
        </div>
        <button onClick={() => setSuccess(null)} className="btn-outline mt-5">
          {t('res.makeAnother')}
        </button>
      </div>
    );
  }

  // ----- Form / review state -----
  return (
    <form onSubmit={handleReview} noValidate className="card p-6">
      <h3 className="font-heading text-2xl text-charcoal">{t('res.title')}</h3>

      {/* Selected range summary */}
      <div className="mt-4 rounded-lg bg-ivory-200 px-4 py-3 text-sm">
        {start ? (
          <div className="space-y-1">
            <div>
              {t('res.dates')}{' '}
              <strong className={rangeTaken ? 'text-red-600' : 'text-green-700'}>
                {prettyRange(start, end || start)}
              </strong>{' '}
              <span className="text-charcoal-light">({days} {dayUnit(days)})</span>
            </div>
            <div className="flex flex-wrap gap-x-4 text-charcoal-light">
              <span>{t('res.rental')} <strong className="text-charcoal">{subtotal} TND</strong></span>
              {dress.deposit > 0 && (
                <span>{t('res.deposit')} <strong className="text-charcoal">{dress.deposit} TND</strong></span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-charcoal-light">{t('res.pickHint')}</span>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {t(error)}
        </div>
      )}

      {confirming ? (
        /* ----- Review & confirm panel ----- */
        <div className="mt-5">
          <p className="text-sm text-charcoal-light">{t('res.reviewIntro')}</p>
          <dl className="mt-3 divide-y divide-ivory-200 rounded-lg border border-ivory-200">
            {[
              [t('res.lblName'), form.customerName],
              [t('res.lblPhone'), form.phone],
              [t('res.lblEmail'), form.email],
              [t('res.lblDress'), dress.name],
              form.size ? [t('res.lblSize'), form.size] : null,
              [t('res.lblDates'), `${prettyRange(start, end || start)} (${days} ${dayUnit(days)})`],
              [t('res.lblTotal'), `${subtotal} TND`],
              form.notes ? [t('res.lblNotes'), form.notes] : null,
            ]
              .filter(Boolean)
              .map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 px-4 py-2 text-sm">
                  <dt className="text-charcoal-light">{label}</dt>
                  <dd className="text-right font-medium text-charcoal">{value}</dd>
                </div>
              ))}
          </dl>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={submitting}
              className="btn-outline flex-1"
            >
              {t('res.edit')}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="btn-primary flex-1"
            >
              {submitting ? t('res.sending') : t('res.confirmSend')}
            </button>
          </div>
        </div>
      ) : (
        /* ----- Editable fields ----- */
        <>
          <div className="mt-5 space-y-4">
            <div>
              <label className="label" htmlFor="customerName">{t('res.fullName')}</label>
              <input id="customerName" className="input" {...fieldProps('customerName')} required placeholder={t('res.namePlaceholder')} />
              <FieldError name="customerName" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="phone">{t('res.phone')}</label>
                <input id="phone" type="tel" className="input" {...fieldProps('phone')} required placeholder="+216 ..." />
                <FieldError name="phone" />
              </div>
              <div>
                <label className="label" htmlFor="email">{t('res.email')}</label>
                <input id="email" type="email" className="input" {...fieldProps('email')} required placeholder="you@example.com" />
                <FieldError name="email" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="dressName">{t('res.selectedDress')}</label>
                <input id="dressName" className="input bg-ivory-200" value={dress.name} readOnly />
              </div>
              {dress.sizes?.length > 0 && (
                <div>
                  <label className="label" htmlFor="size">{t('res.size')}</label>
                  <select id="size" name="size" className="input" value={form.size} onChange={handleChange} required>
                    <option value="">{t('res.chooseSizeOpt')}</option>
                    {dress.sizes.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="label" htmlFor="notes">{t('res.notes')}</label>
              <textarea id="notes" name="notes" rows={3} className="input resize-none" value={form.notes} onChange={handleChange} placeholder={t('res.notesPlaceholder')} />
            </div>
          </div>

          <button type="submit" className="btn-primary mt-6 w-full" disabled={!start || rangeTaken}>
            {t('res.reviewConfirm')}
          </button>
        </>
      )}
    </form>
  );
}
