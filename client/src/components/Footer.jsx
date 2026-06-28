export default function Footer() {
  return (
    <footer className="mt-20 border-t border-rosegold-100 bg-ivory-200">
      <div className="mx-auto max-w-6xl px-4 py-10 text-center">
        <p className="font-heading text-xl text-charcoal">
          Robe<span className="text-rosegold-500">Rent</span>
        </p>
        <p className="mt-2 text-sm text-charcoal-light">
          Elegant wedding dress rentals across Tunisia · Pre-reserve online
        </p>
        <p className="mt-4 text-xs text-charcoal-light/70">
          © {new Date().getFullYear()} RobeRent · Prototype demo
        </p>
      </div>
    </footer>
  );
}
