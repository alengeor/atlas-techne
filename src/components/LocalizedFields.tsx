import { useState } from 'react';
import { locales, type Locale, type LocalizedText } from '../../shared/model';
import { useLanguage } from '../i18n/Language';

export function LocalizedFields({ title, description, onTitle, onDescription, descriptionMaxLength = 30 }: {
  title: LocalizedText; description?: LocalizedText; descriptionMaxLength?: number;
  onTitle: (value: LocalizedText) => void; onDescription?: (value: LocalizedText) => void;
}) {
  const [locale, setLocale] = useState<Locale>('es');
  const { t } = useLanguage();
  return <div className="localized-fields"><div className="locale-tabs" aria-label={t.language}>
    {locales.map(l => <button type="button" key={l} aria-pressed={locale === l} onClick={() => setLocale(l)}>{l.toUpperCase()}<span aria-hidden="true">{title[l].trim() ? ' ✓' : ' ·'}</span></button>)}
    </div><label className={title[locale].length >= 30 ? 'character-limit-reached' : undefined}>{t.title} · {locale.toUpperCase()}<input lang={locale} value={title[locale]} maxLength={30} onChange={e => onTitle({ ...title, [locale]: e.target.value })} />
      {title[locale].length >= 20 && <small role="status">{title[locale].length} / 30</small>}
    </label>
    {description && onDescription && <label className={description[locale].length >= descriptionMaxLength ? 'character-limit-reached' : undefined}>{t.description} · {locale.toUpperCase()}<textarea lang={locale} value={description[locale]} maxLength={descriptionMaxLength} rows={4} onChange={e => onDescription({ ...description, [locale]: e.target.value })} />
      {description[locale].length >= descriptionMaxLength - 10 && <small role="status">{description[locale].length} / {descriptionMaxLength}</small>}
    </label>}
  </div>;
}
