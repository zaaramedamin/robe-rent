import { Link } from 'react-router-dom';
import { FALLBACK_IMG, onImgError } from '../utils/image';

const categoryColors = {
  classic: 'bg-rosegold-100 text-rosegold-700',
  modern: 'bg-charcoal/10 text-charcoal',
  oriental: 'bg-amber-100 text-amber-800',
};

// Gallery card for a single dress.
export default function DressCard({ dress, index = 0 }) {
  const cover = dress.images?.[0] || FALLBACK_IMG;

  return (
    <Link
      to={`/dresses/${dress._id}`}
      style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
      className="card card-hover group animate-fade-up overflow-hidden"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={cover}
          alt={dress.name}
          loading="lazy"
          onError={onImgError}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Subtle gradient for legibility on hover. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span
          className={`badge absolute left-3 top-3 capitalize ${
            categoryColors[dress.category] || 'bg-white text-charcoal'
          }`}
        >
          {dress.category}
        </span>
        {!dress.available && (
          <span className="badge absolute right-3 top-3 bg-red-100 text-red-700">
            Unavailable
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-heading text-xl text-charcoal">{dress.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-charcoal-light">
          {dress.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-rosegold-600">
            {dress.pricePerDay} TND
            <span className="text-xs font-normal text-charcoal-light"> / day</span>
          </span>
          <span className="text-sm font-medium text-rosegold-500 group-hover:underline">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
