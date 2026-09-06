import { createContext, useContext, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Check, ChevronDown, Languages } from 'lucide-react';
import { locales, type Locale } from '../../shared/model';
import { es, pt, en, type Messages } from './messages';

const localeNames: Record<Locale, string> = { es: 'Español', pt: 'Português', en: 'English' };

export function chooseLocale(saved: string | null, browser: string): Locale {
  if (locales.some(l => l === saved)) return locales.find(l => l === saved) ?? 'es';
  return locales.find(l => l === browser.toLowerCase().split('-')[0]) ?? 'es';
}
const Language = createContext<{ locale: Locale; setLocale: (locale: Locale) => void; t: Messages } | null>(null);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    try { return chooseLocale(localStorage.getItem('atlas-austral.locale'), navigator.language); }
    catch { return chooseLocale(null, navigator.language); }
  });
  useEffect(() => {
    document.documentElement.lang = locale;
    try { localStorage.setItem('atlas-austral.locale', locale); } catch { /* Private mode still works in memory. */ }
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
  const [open, setOpen] = useState(false);
  const control = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const options = useRef<Partial<Record<Locale, HTMLButtonElement>>>({});
  const menuId = useId();
  useEffect(() => {
    if (!open) return;
    options.current[locale]?.focus();
    const close = (event: PointerEvent) => {
      if (!control.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [locale, open]);
  const select = (next: Locale) => {
    setLocale(next); setOpen(false); trigger.current?.focus();
  };
  const move = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && open) {
      event.preventDefault(); event.stopPropagation(); setOpen(false); trigger.current?.focus(); return;
    }
    if (!open || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const current = locales.findIndex(item => options.current[item] === document.activeElement);
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? locales.length - 1
      : event.key === 'ArrowDown' ? (current + 1) % locales.length : (current - 1 + locales.length) % locales.length;
    const next = locales[index];
    if (next) options.current[next]?.focus();
  };
  return <div className="language-control" ref={control} onKeyDown={move}>
    <button ref={trigger} type="button" className="language-trigger" aria-label={`${t.language}: ${localeNames[locale]}`} aria-haspopup="menu" aria-expanded={open} aria-controls={menuId} onClick={() => setOpen(value => !value)}>
      <Languages className="language-icon" aria-hidden="true" /><span>{locale.toUpperCase()}</span><ChevronDown className={`language-chevron ${open ? 'open' : ''}`} aria-hidden="true" />
    </button>
    {open && <div className="language-menu" id={menuId} role="menu" aria-label={t.language}>
      {locales.map(item => <button key={item} ref={node => { options.current[item] = node ?? undefined; }} type="button" role="menuitemradio" aria-checked={locale === item} lang={item} onClick={() => select(item)}>
        <span className="language-code">{item.toUpperCase()}</span><span>{localeNames[item]}</span>{locale === item && <Check className="language-check" aria-hidden="true" />}
      </button>)}
    </div>}
  </div>;
}
