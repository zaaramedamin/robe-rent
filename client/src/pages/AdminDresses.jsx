import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDresses, deleteDress } from '../api/services';
import DressForm from '../components/DressForm';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { onImgError, FALLBACK_IMG } from '../utils/image';

// Protected page where the admin manages the dress catalogue:
// add new dresses, edit details/prices/images, and delete dresses.
export default function AdminDresses() {
  const [dresses, setDresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // dress being edited
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setLoading(true);
    setError('');
    getDresses()
      .then(setDresses)
      .catch(() => setError('Could not load dresses.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (dress) => {
    setEditing(dress);
    setFormOpen(true);
  };

  // Called by the form after a successful create/update.
  const handleSaved = (saved) => {
    setDresses((prev) => {
      const exists = prev.some((d) => d._id === saved._id);
      return exists
        ? prev.map((d) => (d._id === saved._id ? saved : d))
        : [saved, ...prev];
    });
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = async (dress) => {
    if (
      !window.confirm(
        `Delete "${dress.name}"? This also removes its images and any reservations for it.`
      )
    )
      return;
    setDeletingId(dress._id);
    try {
      await deleteDress(dress._id);
      setDresses((prev) => prev.filter((d) => d._id !== dress._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete the dress.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin" className="text-sm text-rosegold-600 hover:underline">
            ← Back to dashboard
          </Link>
          <h1 className="mt-1 font-heading text-4xl text-charcoal">Manage dresses</h1>
          <p className="mt-1 text-charcoal-light">
            Add, edit, and remove dresses in your catalogue.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          + Add dress
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={load} />
      ) : dresses.length === 0 ? (
        <div className="card mt-8 p-12 text-center">
          <p className="text-charcoal-light">No dresses yet.</p>
          <button onClick={openCreate} className="btn-primary mt-4">
            Add your first dress
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {dresses.map((d, i) => (
            <div
              key={d._id}
              style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
              className="card card-hover animate-fade-up overflow-hidden"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={d.images?.[0] || FALLBACK_IMG}
                  alt={d.name}
                  onError={onImgError}
                  className="h-full w-full object-cover"
                />
                {!d.available && (
                  <span className="badge absolute left-2 top-2 bg-red-100 text-red-700">
                    Hidden
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading text-lg text-charcoal">{d.name}</h3>
                  <span className="whitespace-nowrap font-semibold text-rosegold-600">
                    {d.pricePerDay} TND
                  </span>
                </div>
                <p className="mt-0.5 text-xs capitalize text-charcoal-light">
                  {d.category} · {d.images?.length || 0} image
                  {(d.images?.length || 0) === 1 ? '' : 's'}
                </p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => openEdit(d)} className="btn-outline flex-1 px-4 py-2 text-sm">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(d)}
                    disabled={deletingId === d._id}
                    className="btn px-4 py-2 text-sm border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === d._id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <DressForm
          dress={editing}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
