import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useT } from '../i18n/LanguageContext';
import LanguageToggle from './LanguageToggle';

// Top navigation bar. Shows public links plus an admin entry that
// becomes "Logout" when an admin session is active.
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const { t } = useT();

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/gallery', label: t('nav.gallery') },
    { to: '/calendar', label: t('nav.availability') },
  ];

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition hover:text-rosegold-600 ${
      isActive ? 'text-rosegold-600' : 'text-charcoal-light'
    }`;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-rosegold-100 bg-ivory/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-heading font-bold tracking-tight text-charcoal">
            Robe<span className="text-rosegold-500">Rent</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} end={l.to === '/'}>
              {l.label}
            </NavLink>
          ))}
          {token ? (
            <>
              <NavLink to="/admin" className={linkClass}>
                {t('nav.dashboard')}
              </NavLink>
              <button onClick={handleLogout} className="btn-outline px-4 py-2 text-sm">
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <Link to="/admin/login" className="btn-primary px-5 py-2 text-sm">
              {t('nav.admin')}
            </Link>
          )}
          <LanguageToggle />
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <LanguageToggle />
          <button
            className="text-charcoal"
            onClick={() => setOpen((o) => !o)}
            aria-label={t('nav.toggleMenu')}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-rosegold-100 bg-ivory px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}
            {token ? (
              <>
                <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>
                  {t('nav.dashboard')}
                </NavLink>
                <button onClick={handleLogout} className="btn-outline">
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link to="/admin/login" className="btn-primary" onClick={() => setOpen(false)}>
                {t('nav.adminLogin')}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
