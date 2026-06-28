import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { translations } from './translations';

const LANG_KEY = 'robe_lang';
const SUPPORTED = ['en', 'fr'];

const LanguageContext = createContext(null);

function getInitialLang() {
  const saved =
    typeof localStorage !== 'undefined' && localStorage.getItem(LANG_KEY);
  return SUPPORTED.includes(saved) ? saved : 'en';
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem(LANG_KEY, lang);
  }, [lang]);

  const setLang = useCallback((l) => {
    if (SUPPORTED.includes(l)) setLangState(l);
  }, []);

  const toggle = useCallback(() => {
    setLangState((l) => (l === 'en' ? 'fr' : 'en'));
  }, []);

  // Translate a key, filling {placeholders} from `vars`. Falls back to the
  // English string, then the raw key (so backend messages pass through).
  const t = useCallback(
    (key, vars) => {
      const dict = translations[lang] || translations.en;
      let str = dict[key] ?? translations.en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
      }
      return str;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t, supported: SUPPORTED }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useT() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useT must be used within a LanguageProvider');
  return ctx;
}
