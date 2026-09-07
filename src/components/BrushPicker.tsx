import { brushStyles, type BrushStyle } from '../../shared/model';
import { brushDashArray } from '../canvas/brush';
import { useLanguage } from '../i18n/Language';

export function BrushPicker({ value, color, size, onChange }: { value: BrushStyle; color: string; size: number; onChange: (value: BrushStyle) => void }) {
  const { t } = useLanguage();
  // Keep the full 1–80 range visible at quarter scale without capping it.
  const width = size / 4;
  return <fieldset className="brush-picker">
    <legend>{t.brushStyle}</legend>
    <div className="brush-options">
      {brushStyles.map(style => <button key={style} type="button" className="brush-option" title={t[style]} aria-label={t[style]} aria-pressed={value === style} onClick={() => onChange(style)}>
        <svg viewBox="0 0 80 24" width="80" height="24" aria-hidden="true">
          <path d="M 8 12 H 72" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeDasharray={brushDashArray(style, 6)} />
        </svg>
      </button>)}
    </div>
    <svg className="brush-sample" viewBox="0 0 180 24" width="180" height="24" aria-hidden="true">
      <path d="M 12 12 H 168" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={brushDashArray(value, width)} />
    </svg>
  </fieldset>;
}
