import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import {
  getAdminReservations,
  updateReservationStatus,
  getAdminStats,
} from '../api/services';
import AdminTable from '../components/AdminTable';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { toISODate, prettyDate, isPast, eachDay } from '../utils/date';

// Protected admin dashboard: stats, a reservations table with status
// controls, and a global bookings calendar.
export default function AdminDashboard() {
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDay, setSelectedDay] = useState(new Date());

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([getAdminReservations(), getAdminStats()])
      .then(([res, st]) => {
        setReservations(res);
        setStats(st);
      })
      .catch(() => setError('Could not load dashboard data.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // Update a reservation's status, then patch local state in place.
  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      const updated = await updateReservationStatus(id, status);
      setReservations((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: updated.status } : r))
      );
      // Refresh stats since counts may have changed.
      getAdminStats().then(setStats).catch(() => {});
    } catch {
      alert('Could not update status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Download the current reservations as a CSV file (admin export).
  const exportCsv = () => {
    const headers = ['Customer', 'Phone', 'Email', 'Dress', 'Size', 'Start', 'End', 'Days', 'Total (TND)', 'Deposit (TND)', 'Status', 'Notes'];
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
    const rows = reservations.map((r) => [
      r.customerName,
      r.phone,
      r.email,
      r.dressId?.name || '',
      r.size,
      toISODate(r.startDate),
      toISODate(r.endDate),
      r.rentalDays,
      r.totalPrice,
      r.deposit,
      r.status,
      r.notes,
    ]);
    const csv = [headers, ...rows].map((row) => row.map(esc).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservations-${toISODate(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Group non-cancelled reservations by day (a multi-day rental appears
  // on every day in its range) for the calendar view.
  const byDay = useMemo(() => {
    const map = new Map();
    for (const r of reservations) {
      if (r.status === 'cancelled') continue;
      for (const key of eachDay(r.startDate, r.endDate)) {
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(r);
      }
    }
    return map;
  }, [reservations]);

  const filtered = useMemo(
    () =>
      statusFilter === 'all'
        ? reservations
        : reservations.filter((r) => r.status === statusFilter),
    [reservations, statusFilter]
  );

  const dayBookings = byDay.get(toISODate(selectedDay)) || [];

  if (loading) return <Spinner label="Loading dashboard…" />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-4xl text-charcoal">Admin dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/stats" className="btn-outline">Statistics</Link>
          <Link to="/admin/dresses" className="btn-primary">Manage dresses</Link>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="Reservations this month" value={stats.totalThisMonth} />
          <StatCard label="Total reservations" value={stats.totalAll} />
          <div className="card p-5">
            <p className="text-sm text-charcoal-light">Most reserved</p>
            {stats.topDresses?.length ? (
              <ol className="mt-2 space-y-1 text-sm">
                {stats.topDresses.slice(0, 3).map((d, i) => (
                  <li key={d.dressId} className="flex justify-between">
                    <span>
                      {i + 1}. {d.name}
                    </span>
                    <span className="font-semibold text-rosegold-600">{d.count}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-sm text-charcoal-light">No data yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Reservations table */}
      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-2xl text-charcoal">Reservations</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            disabled={reservations.length === 0}
            className="btn-outline px-4 py-2 text-sm"
          >
            Export CSV
          </button>
          <select
            className="rounded-lg border border-rosegold-200 bg-white px-3 py-2 text-sm focus:border-rosegold-400 focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      <div className="mt-4">
        <AdminTable
          reservations={filtered}
          onStatusChange={handleStatusChange}
          updatingId={updatingId}
        />
      </div>

      {/* Global bookings calendar */}
      <h2 className="mt-12 font-heading text-2xl text-charcoal">Bookings calendar</h2>
      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div className="card p-4 sm:p-6">
          <Calendar
            onClickDay={setSelectedDay}
            value={selectedDay}
            showNeighboringMonth={false}
            prev2Label={null}
            next2Label={null}
            tileClassName={({ date, view }) =>
              view === 'month' && !isPast(date) && byDay.has(toISODate(date))
                ? 'cal-reserved'
                : null
            }
          />
        </div>
        <div>
          <h3 className="font-heading text-xl text-charcoal">{prettyDate(selectedDay)}</h3>
          {dayBookings.length === 0 ? (
            <p className="mt-3 text-sm text-charcoal-light">No bookings this day.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {dayBookings.map((r) => (
                <li key={r._id} className="card flex items-center justify-between p-4 text-sm">
                  <div>
                    <div className="font-medium">{r.dressId?.name || '—'}</div>
                    <div className="text-charcoal-light">{r.customerName} · {r.phone}</div>
                  </div>
                  <span className="badge bg-ivory-200 capitalize">{r.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-charcoal-light">{label}</p>
      <p className="mt-2 font-heading text-4xl text-rosegold-600">{value}</p>
    </div>
  );
}
