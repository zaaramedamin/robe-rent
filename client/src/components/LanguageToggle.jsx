import { useT } from '../i18n/LanguageContext';

// Compact EN/FR language switch.
export default function LanguageToggle({ className = '' }) {
  const { lang, setLang } = useT();
  const options = [
    ['en', 'EN'],
    ['fr', 'FR'],
  ];

  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex overflow-hidden rounded-full border border-rosegold-200 text-xs ${className}`}
    >
      {options.map(([code, label]) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`px-2.5 py-1 font-medium transition ${
            lang === code
              ? 'bg-rosegold-500 text-white'
              : 'text-charcoal-light hover:bg-rosegold-50'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
