import { useId, type CSSProperties } from 'react';
import { useLanguage } from '../i18n/Language';

export function OpacityControl({ value, title, onChange }: { value: number; title: string; onChange: (value: number) => void }) {
  const id = useId();
  const { t } = useLanguage();
  const percent = Math.round(value * 100);
  return <label className="opacity-control" htmlFor={id}>
    <span className="opacity-heading"><span>{t.opacity}</span><output htmlFor={id}>{percent}%</output></span>
    <input id={id} className="opacity-slider" aria-label={`${t.opacity} ${title}`} aria-valuetext={`${percent}%`} type="range" min="0" max="1" step="0.05" value={value} style={{ '--opacity-fill': `${percent}%` } as CSSProperties} onChange={event => onChange(Number(event.target.value))} />
  </label>;
}
