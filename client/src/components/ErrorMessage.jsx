// Inline error banner with an optional retry button.
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="mx-auto my-8 max-w-lg rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-center">
      <p className="text-red-700">{message || 'Something went wrong.'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline mt-3">
          Try again
        </button>
      )}
    </div>
  );
}
