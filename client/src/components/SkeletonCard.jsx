// Placeholder card shown while the gallery loads, to avoid layout shift.
export default function SkeletonCard() {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      <div className="aspect-[3/4] animate-pulse bg-ivory-200" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded bg-ivory-200" />
        <div className="h-4 w-full animate-pulse rounded bg-ivory-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-ivory-200" />
      </div>
    </div>
  );
}
