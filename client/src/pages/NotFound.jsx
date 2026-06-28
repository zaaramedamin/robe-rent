import { Link } from 'react-router-dom';
import { useT } from '../i18n/LanguageContext';

export default function NotFound() {
  const { t } = useT();
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-heading text-6xl text-rosegold-500">404</h1>
      <p className="mt-4 text-charcoal-light">{t('nf.message')}</p>
      <Link to="/" className="btn-primary mt-6">
        {t('nf.back')}
      </Link>
    </div>
  );
}
