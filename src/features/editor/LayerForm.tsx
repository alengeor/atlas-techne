import { useEffect, useRef, useState } from 'react';
import { localized, type LocalizedText, type MapLayer } from '../../../shared/model';
import { Dialog } from '../../components/Dialog';
import { LocalizedFields } from '../../components/LocalizedFields';
import { Icon } from '../../components/Icon';
import { useLanguage } from '../../i18n/Language';
import { readImage, type LocalImage } from '../assets/readImage';
import { apiMessage } from '../../i18n/apiErrors';

export function LayerForm({ onClose, onApply, onDrawOverlay, newMap = false }: {
  newMap?: boolean; onClose: () => void;
  onApply: (image: LocalImage, title: LocalizedText, kind: MapLayer['kind'], progress: (percent: number) => void) => Promise<void>;
  onDrawOverlay?: () => void;
}) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(localized());
  const [kind, setKind] = useState<MapLayer['kind']>('overlay');
  const [image, setImage] = useState<LocalImage | null>(null);
  const imageRef = useRef<LocalImage | null>(null);
  const alive = useRef(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  useEffect(() => { alive.current = true; return () => { alive.current = false; if (imageRef.current) URL.revokeObjectURL(imageRef.current.url); }; }, []);
  return <Dialog title={newMap ? t.newMap : t.addLayer} onClose={() => { if (!busy) onClose(); }}>
    <form onSubmit={e => { e.preventDefault(); if (!image || !title.es.trim()) { setError(t.fileRequired); return; } setBusy(true); setError(''); void onApply(image, title, newMap ? 'base' : kind, setProgress).catch(error => { if (alive.current) setError(apiMessage(error, t)); }).finally(() => { if (alive.current) setBusy(false); }); }}>
      <div className="dialog-body">
        <p>{newMap ? t.createMapHelp : t.freeAspect}</p>
        <LocalizedFields title={title} onTitle={setTitle} />
        {!newMap && <label>{t.layerKind}<select value={kind} onChange={e => setKind(e.target.value === 'base' ? 'base' : 'overlay')}><option value="overlay">{t.overlay}</option><option value="base">{t.alternative}</option></select></label>}
        <label className="file-drop"><Icon name="upload" /><strong>{busy ? t.uploadBusy : t.layerImage}</strong><span>{t.imageFormats}</span><input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={e => {
          const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
          setBusy(true); setError('');
          void readImage(file).then(next => {
            if (!alive.current) { URL.revokeObjectURL(next.url); return; }
            if (imageRef.current) URL.revokeObjectURL(imageRef.current.url);
            imageRef.current = next; setImage(next);
          }).catch(() => { if (alive.current) setError(t.invalidImage); }).finally(() => { if (alive.current) setBusy(false); });
        }} /></label>
        {image && <div className="upload-preview"><img src={image.url} alt="" /><span>{image.name}<small>{image.width} × {image.height}</small></span></div>}
        {!newMap && onDrawOverlay && <button type="button" className="wide-button" disabled={busy} onClick={onDrawOverlay}>{t.drawOverlay}</button>}
        {error && <p role="alert" className="form-error">{error}</p>}
        {busy && <label>{t.uploading} {progress}%<progress value={progress} max={100} /></label>}
      </div><footer className="dialog-footer"><button type="button" disabled={busy} onClick={onClose}>{t.cancel}</button><button className="primary" disabled={busy} type="submit">{busy ? t.uploading : newMap ? t.createMap : t.addLayer}</button></footer>
    </form>
  </Dialog>;
}
