import { useState } from 'react';
import { systemIcons, type Appearance } from '../../../shared/model';
import { Icon } from '../../components/Icon';
import { useLanguage } from '../../i18n/Language';
import { readImage, type LocalImage } from '../assets/readImage';

export const markerColors = ['#e6b65e', '#ff637c', '#66d5b0', '#53bafb', '#ffad46', '#b19cff'];
export function AppearancePicker({ value, onChange, customIcons, onImage, assetUrl }: {
  value: Appearance; onChange: (value: Appearance) => void; customIcons: string[];
  onImage: (image: LocalImage) => Promise<string>; assetUrl: (id: string) => string;
}) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  return <div className="appearance-picker">
    <fieldset><legend>{t.appearance}</legend><div className="icon-grid">{systemIcons.map(icon => <button type="button" key={icon} className="icon-choice" aria-label={t[icon]} aria-pressed={value.kind === 'system' && value.icon === icon} onClick={() => onChange({ kind: 'system', icon, color: value.kind === 'system' ? value.color : '#e6b65e' })}><Icon name={icon} /></button>)}</div></fieldset>
    <fieldset><legend>{t.custom}</legend><div className="icon-grid">{customIcons.map(id => <button type="button" key={id} className="icon-choice" aria-label={`${t.custom} ${customIcons.indexOf(id) + 1}`} aria-pressed={value.kind === 'custom' && value.assetId === id} onClick={() => onChange({ kind: 'custom', assetId: id })}><img src={assetUrl(id)} alt="" /></button>)}
      <label className={`file-button icon-choice upload ${busy ? 'disabled' : ''}`} title={t.uploadIcon}><Icon name="upload" /><span className="sr-only">{t.uploadIcon}</span><input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={e => {
        const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
        setBusy(true); setError(false);
        void readImage(file).then(async image => {
          if (image.width > 1024 || image.height > 1024 || file.size > 2 * 1024 * 1024) { URL.revokeObjectURL(image.url); throw new Error('invalidImage'); }
          try { const id = await onImage(image); onChange({ kind: 'custom', assetId: id }); }
          finally { URL.revokeObjectURL(image.url); }
        }).catch(() => setError(true)).finally(() => setBusy(false));
      }} /></label></div><small>PNG / JPG / WebP · 2 MB · 1024 × 1024</small>
    </fieldset>
    {value.kind === 'system' && <fieldset><legend>{t.color}</legend><div className="color-grid">{markerColors.map(color => <button type="button" key={color} className="color-choice" style={{ color }} aria-label={`${t.color} ${color}`} aria-pressed={value.color === color} onClick={() => onChange({ ...value, color })}><Icon name={value.icon} /></button>)}<label className="custom-color"><span className="sr-only">{t.color}</span><input type="color" value={value.color} onChange={e => onChange({ ...value, color: e.target.value })} /></label></div></fieldset>}
    {busy && <p role="status">{t.uploadBusy}</p>}{error && <p className="form-error" role="alert">{t.invalidImage}</p>}
  </div>;
}
