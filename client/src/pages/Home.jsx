import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDresses } from '../api/services';
import DressCard from '../components/DressCard';
import Spinner from '../components/Spinner';

// Landing page: hero + a few featured dresses + how-it-works.
export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDresses()
      .then((data) => setFeatured(data.slice(0, 3)))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ivory via-rosegold-50 to-ivory-200">
        {/* Soft floating decorative blobs */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-rosegold-200/40 blur-3xl animate-float" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-rosegold-100/50 blur-3xl animate-float delay-300" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2 md:py-28">
          <div>
            <span className="badge bg-rosegold-100 text-rosegold-700 animate-fade-up">
              Wedding dress rental · Tunisia
            </span>
            <h1 className="mt-5 font-heading text-4xl leading-tight text-charcoal animate-fade-up delay-75 sm:text-5xl md:text-6xl">
              Find your dream dress, <span className="text-rosegold-500">reserve in seconds.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-charcoal-light animate-fade-up delay-150">
              Browse our curated collection of bridal and oriental gowns, check
              real-time availability, and pre-reserve your favourite — all online.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 animate-fade-up delay-300">
              <Link to="/gallery" className="btn-primary">Browse the gallery</Link>
              <Link to="/calendar" className="btn-outline">Check availability</Link>
            </div>
          </div>
          <div className="relative animate-scale-in">
            <img
              src="https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=80"
              alt="Elegant wedding dress"
              className="aspect-[4/5] w-full rounded-3xl object-cover shadow-lift"
            />
            {/* Floating price/availability accent card */}
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl bg-white/90 px-5 py-3 shadow-soft backdrop-blur sm:block animate-fade-up delay-500">
              <p className="text-xs text-charcoal-light">Starting from</p>
              <p className="font-heading text-xl text-rosegold-600">240 TND / day</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured dresses */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-heading text-3xl text-charcoal">Featured gowns</h2>
            <p className="mt-1 text-charcoal-light">A glimpse of our collection.</p>
          </div>
          <Link to="/gallery" className="hidden text-rosegold-600 hover:underline sm:block">
            View all →
          </Link>
        </div>

        {loading ? (
          <Spinner />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((d, i) => (
              <DressCard key={d._id} dress={d} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-ivory-200">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center font-heading text-3xl text-charcoal">
            How it works
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { n: '1', t: 'Browse', d: 'Explore our gallery and filter by style, price, or date.' },
              { n: '2', t: 'Check availability', d: 'See exactly which days each dress is free on its calendar.' },
              { n: '3', t: 'Pre-reserve', d: 'Fill in your details and we confirm your booking shortly.' },
            ].map((s, i) => (
              <div
                key={s.n}
                style={{ animationDelay: `${i * 120}ms` }}
                className="card card-hover animate-fade-up p-6 text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rosegold-500 font-heading text-xl text-white">
                  {s.n}
                </div>
                <h3 className="mt-4 font-heading text-xl text-charcoal">{s.t}</h3>
                <p className="mt-2 text-sm text-charcoal-light">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
