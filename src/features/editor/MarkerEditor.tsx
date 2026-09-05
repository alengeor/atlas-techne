import { useState } from 'react';
import { markerSchema, type Marker } from '../../../shared/model';
import { Dialog } from '../../components/Dialog';
import { LocalizedFields } from '../../components/LocalizedFields';
import { useLanguage } from '../../i18n/Language';
import { AppearancePicker } from './AppearancePicker';
import type { LocalImage } from '../assets/readImage';

export function MarkerEditor({ marker, isNew, customIcons, assetUrl, onImage, onApply, onClose, onDelete }: {
  marker: Marker; isNew: boolean; customIcons: string[]; assetUrl: (id: string) => string;
  onImage: (image: LocalImage) => Promise<string>; onApply: (marker: Marker) => void; onClose: () => void; onDelete: () => void;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState<Marker>(() => structuredClone(marker));
  const [error, setError] = useState(false);
  const [confirm, setConfirm] = useState<'discard' | 'delete' | null>(null);
  const dirty = JSON.stringify(form) !== JSON.stringify(marker);
  const close = () => { if (dirty) setConfirm('discard'); else onClose(); };
  return <Dialog title={isNew ? t.newMarker : t.editMarker} onClose={close} wide>
    <form onSubmit={e => {
      e.preventDefault();
      const parsed = markerSchema.safeParse(form);
      if (!parsed.success || !form.title.es.trim()) { setError(true); return; }
      onApply(parsed.data);
    }}>
      <div className="dialog-body">
        <LocalizedFields title={form.title} description={form.description} onTitle={title => setForm({ ...form, title })} onDescription={description => setForm({ ...form, description })} />
        <AppearancePicker value={form.appearance} onChange={appearance => setForm({ ...form, appearance })} customIcons={customIcons} assetUrl={assetUrl} onImage={onImage} />
        <fieldset><legend>{t.position}</legend><div className="coordinate-fields">{(['x', 'y'] as const).map(axis => <label key={axis}>{axis.toUpperCase()}<input type="number" min={0} max={100} step={0.1} value={Math.round(form.position[axis] * 1000) / 10} onChange={e => setForm({ ...form, position: { ...form.position, [axis]: Math.min(1, Math.max(0, e.target.valueAsNumber / 100 || 0)) } })} /></label>)}</div></fieldset>
        {error && <p className="form-error" role="alert">{t.markerRequired}</p>}
        {confirm && <div className="confirmation" role="alert"><p>{confirm === 'delete' ? t.confirmDelete : t.discard}</p><div className="button-row"><button type="button" onClick={() => setConfirm(null)}>{t.cancel}</button><button type="button" className="danger" onClick={confirm === 'delete' ? onDelete : onClose}>{confirm === 'delete' ? t.delete : t.close}</button></div></div>}
      </div><footer className="dialog-footer">{!isNew && <button type="button" className="danger-quiet" onClick={() => setConfirm('delete')}>{t.delete}</button>}<div className="button-row"><button type="button" onClick={close}>{t.cancel}</button><button className="primary" type="submit">{t.apply}</button></div></footer>
    </form>
  </Dialog>;
}
