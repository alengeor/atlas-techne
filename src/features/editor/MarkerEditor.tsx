import { useState } from 'react';
import { markerSchema, type Marker, type MarkerCategory } from '../../../shared/model';
import { Dialog } from '../../components/Dialog';
import { LocalizedFields } from '../../components/LocalizedFields';
import { useLanguage } from '../../i18n/Language';
import { AppearancePicker } from './AppearancePicker';
import { readImage, type LocalImage } from '../assets/readImage';

export function MarkerEditor({ marker, categories, isNew, customIcons, assetUrl, onImage, onMediaUpload, onApply, onClose, onDelete }: {
  marker: Marker; categories: MarkerCategory[]; isNew: boolean; customIcons: string[]; assetUrl: (id: string) => string;
  onImage: (image: LocalImage) => Promise<string>; onMediaUpload?: (image: LocalImage) => Promise<string>;
  onApply: (marker: Marker) => void; onClose: () => void; onDelete: () => void;
}) {
  const { locale, t } = useLanguage();
  const [form, setForm] = useState<Marker>(() => structuredClone(marker));
  const [error, setError] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<'discard' | 'delete' | null>(null);
  const dirty = JSON.stringify(form) !== JSON.stringify(marker);
  const close = () => { if (dirty) setConfirm('discard'); else onClose(); };
  const addMediaFile = async (file: File | null) => {
    if (!file || !onMediaUpload) return;
    if (form.media.length >= 3) { setMediaError(t.maxMedia); return; }
    setBusy(true); setMediaError('');
    try {
      const isVideo = /^video\//i.test(file.type) || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
      if (isVideo) {
        const assetId = await onMediaUpload({ id: crypto.randomUUID(), url: URL.createObjectURL(file), width: 0, height: 0, extension: file.name.split('.').pop() ?? 'mp4', name: file.name, file });
        setForm({ ...form, media: [...form.media, { id: crypto.randomUUID(), kind: 'video', assetId }] });
        return;
      }
      const image = await readImage(file);
      const assetId = await onMediaUpload(image);
      const media = { id: crypto.randomUUID(), kind: 'image' as const, assetId };
      setForm({ ...form, media: [...form.media, media] });
    } catch {
      setMediaError(t.invalidImage);
    } finally { setBusy(false); }
  };
  const removeMedia = (id: string) => { setForm({ ...form, media: form.media.filter(item => item.id !== id) }); };
  return <Dialog title={isNew ? t.newMarker : t.editMarker} onClose={close} wide>
    <form onSubmit={e => {
      e.preventDefault();
      const parsed = markerSchema.safeParse(form);
      if (!parsed.success || !form.title.es.trim()) { setError(true); return; }
      onApply(parsed.data);
    }}>
      <div className="dialog-body">
        <LocalizedFields title={form.title} description={form.description} onTitle={title => setForm({ ...form, title })} onDescription={description => setForm({ ...form, description })} />
        <fieldset><legend>{t.markerCategory}</legend><label>{t.markerCategory}
          <select value={form.categoryId ?? ''} onChange={event => setForm({ ...form, categoryId: event.target.value || undefined })}>
            <option value="">{t.alwaysVisible}</option>
            {categories.map(category => <option key={category.id} value={category.id}>{category.title[locale] || category.title.es}</option>)}
          </select>
        </label><small>{t.markerCategoryHelp}</small></fieldset>
        <AppearancePicker value={form.appearance} onChange={appearance => setForm({ ...form, appearance })} customIcons={customIcons} assetUrl={assetUrl} onImage={onImage} />
        <fieldset><legend>{t.referenceText}</legend><div className="coordinate-fields">
          <label>{t.referencePosition}<select value={form.labelPosition} onChange={e => setForm({ ...form, labelPosition: e.target.value as Marker['labelPosition'] })}>
            <option value="north">{t.north}</option><option value="north-east">{t.northEast}</option><option value="east">{t.east}</option><option value="south-east">{t.southEast}</option>
            <option value="south">{t.south}</option><option value="south-west">{t.southWest}</option><option value="west">{t.west}</option><option value="north-west">{t.northWest}</option>
          </select></label>
          <label>{t.referenceDistance}<input type="number" min={0} max={200} step={1} value={form.labelDistance} onChange={e => { const value = e.target.valueAsNumber; if (Number.isFinite(value)) setForm({ ...form, labelDistance: Math.min(200, Math.max(0, value)) }); }} /></label>
        </div><small>{t.referenceDistanceHelp}</small></fieldset>
        <fieldset><legend>{t.media}</legend>
          {form.media.length > 0 && <div className="marker-media-list">{form.media.map(item => item.kind === 'image' ? <div className="marker-media-item" key={item.id}>
            <img src={assetUrl(item.assetId)} alt="" />
            <button type="button" className="icon-button danger-quiet" aria-label={t.delete} onClick={() => removeMedia(item.id)}><span aria-hidden="true">×</span></button>
          </div> : <div className="marker-media-item" key={item.id}>
            <div className="video-chip">MP4</div>
            <button type="button" className="icon-button danger-quiet" aria-label={t.delete} onClick={() => removeMedia(item.id)}><span aria-hidden="true">×</span></button>
          </div>)} </div>}
          <div className="media-controls">
            <label className="file-button compact" aria-label={t.addImage}><input type="file" accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime" disabled={busy || form.media.length >= 3} onChange={e => { const file = e.target.files?.[0]; if (e.target) e.target.value = ''; void addMediaFile(file ?? null); }} /><span>{t.addImage}</span></label>
          </div>
          {form.media.length >= 3 && <small>{t.maxMedia}</small>}
          {mediaError && <p className="form-error" role="alert">{mediaError}</p>}
        </fieldset>
        <fieldset><legend>{t.position}</legend><div className="coordinate-fields">{(['x', 'y'] as const).map(axis => <label key={axis}>{axis.toUpperCase()}<input type="number" min={0} max={100} step={0.1} value={Math.round(form.position[axis] * 1000) / 10} onChange={e => setForm({ ...form, position: { ...form.position, [axis]: Math.min(1, Math.max(0, e.target.valueAsNumber / 100 || 0)) } })} /></label>)}</div></fieldset>
        {error && <p className="form-error" role="alert">{t.markerRequired}</p>}
        {confirm && <div className="confirmation" role="alert"><p>{confirm === 'delete' ? t.confirmDelete : t.discard}</p><div className="button-row"><button type="button" onClick={() => setConfirm(null)}>{t.cancel}</button><button type="button" className="danger" onClick={confirm === 'delete' ? onDelete : onClose}>{confirm === 'delete' ? t.delete : t.close}</button></div></div>}
      </div><footer className="dialog-footer">{!isNew && <button type="button" className="danger-quiet" onClick={() => setConfirm('delete')}>{t.delete}</button>}<div className="button-row"><button type="button" onClick={close}>{t.cancel}</button><button className="primary" type="submit">{t.apply}</button></div></footer>
    </form>
  </Dialog>;
}
