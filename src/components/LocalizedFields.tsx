import { useState } from 'react';
import { locales, type Locale, type LocalizedText } from '../../shared/model';
import { useLanguage } from '../i18n/Language';

export function LocalizedFields({ title, description, onTitle, onDescription }: {
  title: LocalizedText; description?: LocalizedText;
  onTitle: (value: LocalizedText) => void; onDescription?: (value: LocalizedText) => void;
}) {
  const [locale, setLocale] = useState<Locale>('es');
  const { t } = useLanguage();
  return <div className="localized-fields"><div className="locale-tabs" aria-label={t.language}>
    {locales.map(l => <button type="button" key={l} aria-pressed={locale === l} onClick={() => setLocale(l)}>{l.toUpperCase()}<span aria-hidden="true">{title[l].trim() ? ' ✓' : ' ·'}</span></button>)}
    </div><label>{t.title} · {locale.toUpperCase()}<input lang={locale} value={title[locale]} maxLength={160} onChange={e => onTitle({ ...title, [locale]: e.target.value })} /></label>
    {description && onDescription && <label>{t.description} · {locale.toUpperCase()}<textarea lang={locale} value={description[locale]} maxLength={8000} rows={4} onChange={e => onDescription({ ...description, [locale]: e.target.value })} /></label>}
  </div>;
}
