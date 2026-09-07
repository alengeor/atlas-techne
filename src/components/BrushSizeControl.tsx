import { useId, type CSSProperties } from 'react';
import { useLanguage } from '../i18n/Language';

export function BrushSizeControl({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const id = useId();
  const { t } = useLanguage();
  const progress = (value - 1) / 79;
  return <div className="brush-size-control">
    <label className="drawing-control-title" htmlFor={id}>{t.brushSize}</label>
    <div className="brush-size-row">
      <button type="button" className="brush-size-step" aria-label={`${t.brushSize}: −1 px`} disabled={value <= 1} onClick={() => onChange(Math.max(1, value - 1))}>−</button>
      <div className="brush-size-slider" style={{ '--size-position': `calc(${progress * 100}% + ${21 - progress * 42}px)` } as CSSProperties}>
        <input id={id} type="range" min="1" max="80" step="1" value={value} aria-valuetext={`${value} px`} onChange={event => onChange(Number(event.target.value))} />
        <output htmlFor={id} aria-hidden="true">{value}</output>
      </div>
      <button type="button" className="brush-size-step" aria-label={`${t.brushSize}: +1 px`} disabled={value >= 80} onClick={() => onChange(Math.min(80, value + 1))}>+</button>
    </div>
  </div>;
}
