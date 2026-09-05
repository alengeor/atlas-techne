import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { locales, type Locale } from '../../shared/model';
import { es, pt, en, type Messages } from './messages';

export function chooseLocale(saved: string | null, browser: string): Locale {
  if (locales.some(l => l === saved)) return locales.find(l => l === saved) ?? 'es';
  return locales.find(l => l === browser.toLowerCase().split('-')[0]) ?? 'es';
}
const Language = createContext<{ locale: Locale; setLocale: (locale: Locale) => void; t: Messages } | null>(null);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    try { return chooseLocale(localStorage.getItem('atlas-techne.locale'), navigator.language); }
    catch { return chooseLocale(null, navigator.language); }
  });
  useEffect(() => {
    document.documentElement.lang = locale;
    try { localStorage.setItem('atlas-techne.locale', locale); } catch { /* Private mode still works in memory. */ }
  }, [locale]);
  return <Language.Provider value={{ locale, setLocale, t: { es, pt, en }[locale] }}>{children}</Language.Provider>;
}
export function useLanguage() {
  const value = useContext(Language);
  if (!value) throw new Error('LanguageProvider is required');
  return value;
}
export function LanguageSelector() {
  const { locale, setLocale, t } = useLanguage();
  return <label className="language-control"><span aria-hidden="true">◎</span><span className="sr-only">{t.language}</span>
    <select value={locale} onChange={e => setLocale(chooseLocale(e.target.value, 'es'))}>
      <option value="es" lang="es" aria-label="Español">ES</option><option value="pt" lang="pt" aria-label="Português">PT</option><option value="en" lang="en" aria-label="English">EN</option>
    </select></label>;
}
