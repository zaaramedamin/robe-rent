import { useEffect, useState } from 'react';
import { createDress, updateDress } from '../api/services';
import { onImgError } from '../utils/image';

const CATEGORIES = ['classic', 'modern', 'oriental'];

/**
 * Modal form to create or edit a dress.
 * Props:
 *  - dress:    existing dress for edit mode (omit for create)
 *  - onClose:  () => void
 *  - onSaved:  (dress) => void  called after a successful save
 *
 * Images are uploaded as real files (multipart) and stored in the
 * database by the backend. In edit mode the admin can remove existing
 * images and/or add new ones.
 */
export default function DressForm({ dress, onClose, onSaved }) {
  const isEdit = Boolean(dress);

  const [form, setForm] = useState({
    name: dress?.name || '',
    description: dress?.description || '',
    category: dress?.category || 'classic',
    pricePerDay: dress?.pricePerDay ?? '',
    deposit: dress?.deposit ?? '',
    sizes: (dress?.sizes || []).join(', '),
    available: dress?.available ?? true,
  });

  // Existing images (URLs) the admin chooses to keep.
  const [existingImages, setExistingImages] = useState(dress?.images || []);
  // Newly selected File objects + their preview object URLs.
  const [newFiles, setNewFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Build/revoke object URLs for the newly selected files.
  useEffect(() => {
    const urls = newFiles.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [newFiles]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    setNewFiles((prev) => [...prev, ...files]);
    e.target.value = ''; // allow re-selecting the same file
  };

  const removeExisting = (url) =>
    setExistingImages((imgs) => imgs.filter((u) => u !== url));

  const removeNewFile = (idx) =>
    setNewFiles((files) => files.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || form.pricePerDay === '') {
      setError('Name and price are required.');
      return;
    }
    if (existingImages.length === 0 && newFiles.length === 0) {
      setError('Please add at least one image.');
      return;
    }

    // Build multipart payload.
    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('description', form.description);
    fd.append('category', form.category);
    fd.append('pricePerDay', String(form.pricePerDay));
    fd.append('deposit', String(form.deposit || 0));
    fd.append('sizes', form.sizes); // comma-separated; backend parses
    fd.append('available', String(form.available));
    if (isEdit) fd.append('existingImages', JSON.stringify(existingImages));
    newFiles.forEach((file) => fd.append('images', file));

    setSubmitting(true);
    try {
      const saved = isEdit
        ? await updateDress(dress._id, fd)
        : await createDress(fd);
      onSaved?.(saved);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the dress.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-charcoal/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="card my-8 w-full max-w-2xl animate-scale-in p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl text-charcoal">
            {isEdit ? 'Edit dress' : 'Add a new dress'}
          </h2>
          <button
            onClick={onClose}
            className="text-charcoal-light hover:text-charcoal"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input id="name" name="name" className="input" value={form.name} onChange={handleChange} required />
          </div>

          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="input resize-none"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="category">Category</label>
              <select id="category" name="category" className="input" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c[0].toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="pricePerDay">Price / day (TND)</label>
              <input id="pricePerDay" name="pricePerDay" type="number" min="0" className="input" value={form.pricePerDay} onChange={handleChange} required />
            </div>
            <div>
              <label className="label" htmlFor="deposit">Deposit (TND)</label>
              <input id="deposit" name="deposit" type="number" min="0" className="input" value={form.deposit} onChange={handleChange} placeholder="0" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="sizes">Sizes (comma-separated)</label>
              <input id="sizes" name="sizes" className="input" value={form.sizes} onChange={handleChange} placeholder="e.g. XS, S, M, L, XL" />
            </div>
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-2 pb-2.5">
                <input
                  type="checkbox"
                  name="available"
                  checked={form.available}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-rosegold-300 text-rosegold-500 focus:ring-rosegold-300"
                />
                <span className="text-sm text-charcoal-light">Available for rental</span>
              </label>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="label">Images</label>
            <div className="flex flex-wrap gap-3">
              {/* Existing (kept) images */}
              {existingImages.map((url) => (
                <div key={url} className="relative h-24 w-20 overflow-hidden rounded-lg border border-rosegold-100">
                  <img src={url} alt="" onError={onImgError} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExisting(url)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-charcoal/70 text-xs text-white hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {/* New file previews */}
              {previews.map((url, i) => (
                <div key={url} className="relative h-24 w-20 overflow-hidden rounded-lg border border-rosegold-300 ring-2 ring-rosegold-200">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewFile(i)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-charcoal/70 text-xs text-white hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {/* Upload button */}
              <label className="flex h-24 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-rosegold-300 text-rosegold-500 transition hover:bg-rosegold-50">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span className="text-[10px]">Add</span>
                <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
              </label>
            </div>
            <p className="mt-1.5 text-xs text-charcoal-light">
              JPG/PNG, up to 5MB each. Stored securely in the database.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create dress'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
