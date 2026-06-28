import { prettyRange } from '../utils/date';
import { whatsappUrl } from '../utils/whatsapp';

const statusStyles = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-green-100 text-green-700',
  out: 'bg-blue-100 text-blue-700',
  returned: 'bg-charcoal/10 text-charcoal',
  late: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_OPTIONS = ['pending', 'confirmed', 'out', 'returned', 'late', 'cancelled'];

// A clickable, sortable column header.
function SortableTh({ label, sortKey, sort, onSort, className = '' }) {
  const active = sort?.key === sortKey;
  const arrow = active ? (sort.dir === 'asc' ? '▲' : '▼') : '';
  return (
    <th
      className={`px-4 py-3 font-medium ${className}`}
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort?.(sortKey)}
        className="inline-flex items-center gap-1 hover:text-charcoal"
      >
        {label}
        <span className="text-[10px] text-rosegold-500">{arrow}</span>
      </button>
    </th>
  );
}

/**
 * Admin reservations table.
 * Props:
 *  - reservations: array (each with populated dressId)
 *  - onStatusChange: (id, status) => void
 *  - updatingId: id currently being updated (to disable its control)
 *  - sort: { key, dir } current sort state
 *  - onSort: (key) => void  toggles sort on a column
 */
export default function AdminTable({
  reservations,
  onStatusChange,
  updatingId,
  sort,
  onSort,
}) {
  if (!reservations.length) {
    return (
      <p className="py-10 text-center text-charcoal-light">
        No reservations match your search or filters.
      </p>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-ivory-200 text-charcoal-light">
            <tr>
              <SortableTh label="Customer" sortKey="customerName" sort={sort} onSort={onSort} />
              <th className="px-4 py-3 font-medium">Contact</th>
              <SortableTh label="Dress" sortKey="dressName" sort={sort} onSort={onSort} />
              <SortableTh label="Dates" sortKey="startDate" sort={sort} onSort={onSort} />
              <SortableTh label="Total" sortKey="totalPrice" sort={sort} onSort={onSort} />
              <SortableTh label="Status" sortKey="status" sort={sort} onSort={onSort} />
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
                  <a
                    href={whatsappUrl(
                      r.phone,
                      `Bonjour ${r.customerName}, concernant votre réservation de « ${
                        r.dressId?.name || 'la robe'
                      } » (${prettyRange(r.startDate, r.endDate)}) chez RobeRent :`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Message ${r.customerName} on WhatsApp`}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-green-700 hover:underline"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.515 5.26l-.999 3.648 3.973-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    WhatsApp
                  </a>
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
