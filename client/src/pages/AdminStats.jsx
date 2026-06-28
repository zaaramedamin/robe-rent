import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAdminStats,
  getAdminStatsHistory,
  getAdminClients,
} from '../api/services';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { prettyDate } from '../utils/date';

// Format a number as Tunisian Dinars.
const tnd = (n) => `${Number(n || 0).toLocaleString()} TND`;

const statusStyles = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-green-100 text-green-700',
  out: 'bg-blue-100 text-blue-700',
  returned: 'bg-charcoal/10 text-charcoal',
  late: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-red-100 text-red-700',
};
const ALL_STATUSES = ['confirmed', 'out', 'returned', 'late', 'pending', 'cancelled'];

// Admin statistics & history: revenue/gains, monthly trends, status &
// category breakdowns, top dresses, and a full client history table.
export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([getAdminStats(), getAdminStatsHistory(), getAdminClients()])
      .then(([s, h, c]) => {
        setStats(s);
        setHistory(h);
        setClients(c);
      })
      .catch(() => setError('Could not load statistics.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <Spinner label="Loading statistics…" />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  const maxRevenue = Math.max(1, ...history.map((h) => h.potential));
  const totalReservations = Object.values(stats?.statusCounts || {}).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin" className="text-sm text-rosegold-600 hover:underline">
            ← Back to dashboard
          </Link>
          <h1 className="mt-1 font-heading text-4xl text-charcoal">Statistics &amp; history</h1>
          <p className="mt-1 text-charcoal-light">Gains, trends, and client activity.</p>
        </div>
        <Link to="/admin/dresses" className="btn-outline">Manage dresses</Link>
      </div>

      {/* KPI cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Realized gains"
          value={tnd(stats.revenue.realized)}
          sub={`+ ${tnd(stats.revenue.depositsHeld)} deposits held`}
          accent
        />
        <Kpi label="Pending (potential)" value={tnd(stats.revenue.pending)} />
        <Kpi label="Gains this month" value={tnd(stats.revenue.thisMonthRealized)} />
        <Kpi label="Total reservations" value={totalReservations} />
      </div>

      {/* Monthly history chart */}
      <section className="card mt-8 p-6">
        <h2 className="font-heading text-2xl text-charcoal">Monthly history</h2>
        <p className="text-sm text-charcoal-light">Confirmed gains (solid) vs. potential incl. pending (light), by reservation month.</p>

        {history.length === 0 ? (
          <p className="py-10 text-center text-charcoal-light">No reservation history yet.</p>
        ) : (
          <>
            {/* Simple CSS bar chart */}
            <div className="mt-6 flex h-52 items-end gap-3 overflow-x-auto pb-2">
              {history.map((h) => (
                <div key={h.month} className="flex min-w-[48px] flex-1 flex-col items-center gap-2">
                  <div className="relative flex h-40 w-full items-end justify-center">
                    {/* potential (light) */}
                    <div
                      className="absolute bottom-0 w-7 rounded-t bg-rosegold-200 transition-all"
                      style={{ height: `${(h.potential / maxRevenue) * 100}%` }}
                      title={`Potential: ${tnd(h.potential)}`}
                    />
                    {/* confirmed (solid) on top */}
                    <div
                      className="absolute bottom-0 w-7 rounded-t bg-rosegold-500 transition-all"
                      style={{ height: `${(h.revenue / maxRevenue) * 100}%` }}
                      title={`Confirmed: ${tnd(h.revenue)}`}
                    />
                  </div>
                  <span className="whitespace-nowrap text-[10px] text-charcoal-light">{h.label}</span>
                </div>
              ))}
            </div>

            {/* History table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-charcoal-light">
                  <tr className="border-b border-rosegold-100">
                    <th className="py-2 pr-4 font-medium">Month</th>
                    <th className="py-2 pr-4 font-medium">Reservations</th>
                    <th className="py-2 pr-4 font-medium">Realized</th>
                    <th className="py-2 pr-4 font-medium">Pending</th>
                    <th className="py-2 pr-4 font-medium">Cancelled</th>
                    <th className="py-2 pr-4 font-medium">Gains</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rosegold-50">
                  {history.map((h) => (
                    <tr key={h.month} className="hover:bg-ivory-100">
                      <td className="py-2 pr-4">{h.label}</td>
                      <td className="py-2 pr-4">{h.reservations}</td>
                      <td className="py-2 pr-4 text-green-700">{h.realized}</td>
                      <td className="py-2 pr-4 text-amber-700">{h.pending}</td>
                      <td className="py-2 pr-4 text-red-600">{h.cancelled}</td>
                      <td className="py-2 pr-4 font-semibold text-rosegold-600">{tnd(h.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* Breakdowns */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-heading text-2xl text-charcoal">By status</h2>
          <div className="mt-4 space-y-3">
            {ALL_STATUSES.map((s) => {
              const count = stats.statusCounts[s] || 0;
              const pct = totalReservations ? (count / totalReservations) * 100 : 0;
              return (
                <div key={s}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className={`badge capitalize ${statusStyles[s]}`}>{s}</span>
                    <span className="text-charcoal-light">{count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-ivory-200">
                    <div
                      className="h-2 rounded-full bg-rosegold-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-heading text-2xl text-charcoal">By category</h2>
          {stats.categoryCounts?.length ? (
            <div className="mt-4 space-y-3">
              {stats.categoryCounts.map((c) => {
                const max = Math.max(1, ...stats.categoryCounts.map((x) => x.count));
                return (
                  <div key={c.category}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="capitalize text-charcoal">{c.category}</span>
                      <span className="text-charcoal-light">{c.count}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-ivory-200">
                      <div
                        className="h-2 rounded-full bg-rosegold-500 transition-all"
                        style={{ width: `${(c.count / max) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-charcoal-light">No data yet.</p>
          )}
        </section>
      </div>

      {/* Top dresses */}
      <section className="card mt-8 p-6">
        <h2 className="font-heading text-2xl text-charcoal">Most reserved dresses</h2>
        {stats.topDresses?.length ? (
          <ol className="mt-4 space-y-2">
            {stats.topDresses.map((d, i) => (
              <li key={d.dressId} className="flex items-center justify-between rounded-lg bg-ivory-100 px-4 py-2 text-sm">
                <span>
                  <span className="mr-2 font-semibold text-rosegold-600">#{i + 1}</span>
                  {d.name}
                </span>
                <span className="font-medium">{d.count} bookings</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-sm text-charcoal-light">No data yet.</p>
        )}
      </section>

      {/* Client history */}
      <section className="card mt-8 p-6">
        <h2 className="font-heading text-2xl text-charcoal">Client history</h2>
        <p className="text-sm text-charcoal-light">Every customer and their booking activity.</p>
        {clients.length === 0 ? (
          <p className="py-8 text-center text-charcoal-light">No clients yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="text-charcoal-light">
                <tr className="border-b border-rosegold-100">
                  <th className="py-2 pr-4 font-medium">Client</th>
                  <th className="py-2 pr-4 font-medium">Contact</th>
                  <th className="py-2 pr-4 font-medium">Bookings</th>
                  <th className="py-2 pr-4 font-medium">Realized</th>
                  <th className="py-2 pr-4 font-medium">Pending</th>
                  <th className="py-2 pr-4 font-medium">Total spend</th>
                  <th className="py-2 pr-4 font-medium">Last booking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rosegold-50">
                {clients.map((c) => (
                  <tr key={c.email} className="hover:bg-ivory-100">
                    <td className="py-2 pr-4 font-medium text-charcoal">{c.name}</td>
                    <td className="py-2 pr-4 text-charcoal-light">
                      <div>{c.phone}</div>
                      <div className="text-xs">{c.email}</div>
                    </td>
                    <td className="py-2 pr-4">{c.totalReservations}</td>
                    <td className="py-2 pr-4 text-green-700">{c.realized}</td>
                    <td className="py-2 pr-4 text-amber-700">{c.pending}</td>
                    <td className="py-2 pr-4 font-semibold text-rosegold-600">{tnd(c.totalSpend)}</td>
                    <td className="py-2 pr-4 whitespace-nowrap">{prettyDate(c.lastReservation)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Kpi({ label, value, sub, accent }) {
  return (
    <div className={`card p-5 ${accent ? 'ring-1 ring-rosegold-200' : ''}`}>
      <p className="text-sm text-charcoal-light">{label}</p>
      <p className={`mt-2 font-heading text-3xl ${accent ? 'text-rosegold-600' : 'text-charcoal'}`}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-charcoal-light">{sub}</p>}
    </div>
  );
}
