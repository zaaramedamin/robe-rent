import { prettyRange } from '../utils/date';

const statusStyles = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-green-100 text-green-700',
  out: 'bg-blue-100 text-blue-700',
  returned: 'bg-charcoal/10 text-charcoal',
  late: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_OPTIONS = ['pending', 'confirmed', 'out', 'returned', 'late', 'cancelled'];

/**
 * Admin reservations table.
 * Props:
 *  - reservations: array (each with populated dressId)
 *  - onStatusChange: (id, status) => void
 *  - updatingId: id currently being updated (to disable its control)
 */
export default function AdminTable({ reservations, onStatusChange, updatingId }) {
  if (!reservations.length) {
    return (
      <p className="py-10 text-center text-charcoal-light">No reservations yet.</p>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-ivory-200 text-charcoal-light">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Dress</th>
              <th className="px-4 py-3 font-medium">Dates</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rosegold-100">
            {reservations.map((r) => (
              <tr key={r._id} className="hover:bg-ivory-100">
                <td className="px-4 py-3">
                  <div className="font-medium text-charcoal">{r.customerName}</div>
                  {r.size && (
                    <div className="text-xs text-charcoal-light">Size: {r.size}</div>
                  )}
                  {r.notes && (
                    <div className="text-xs text-charcoal-light">{r.notes}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-charcoal-light">
                  <div>{r.phone}</div>
                  <div className="text-xs">{r.email}</div>
                </td>
                <td className="px-4 py-3">{r.dressId?.name || '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {prettyRange(r.startDate, r.endDate)}
                  <div className="text-xs text-charcoal-light">
                    {r.rentalDays} day{r.rentalDays === 1 ? '' : 's'}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="font-medium text-rosegold-600">{r.totalPrice} TND</div>
                  {r.deposit > 0 && (
                    <div className="text-xs text-charcoal-light">+{r.deposit} dep.</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge capitalize ${statusStyles[r.status] || ''}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={r.status}
                    disabled={updatingId === r._id}
                    onChange={(e) => onStatusChange(r._id, e.target.value)}
                    className="rounded-lg border border-rosegold-200 bg-white px-2 py-1.5 text-sm capitalize focus:border-rosegold-400 focus:outline-none disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s[0].toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
