// Simple centered loading spinner used across pages.
export default function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-rosegold-200 border-t-rosegold-500" />
      <p className="text-sm text-charcoal-light">{label}</p>
    </div>
  );
}
