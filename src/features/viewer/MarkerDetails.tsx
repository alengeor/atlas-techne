import { useState } from 'react';
import type { Marker } from '../../../shared/model';
import { Dialog } from '../../components/Dialog';
import { Icon } from '../../components/Icon';
import { LanguageSelector, useLanguage } from '../../i18n/Language';

export function MarkerDetails({ marker, assetUrl, onClose }: { marker: Marker; assetUrl: (id: string) => string; onClose: () => void }) {
  const { locale, t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const media = marker.media[index];
  const change = (delta: number) => { setIndex(i => (i + delta + marker.media.length) % marker.media.length); setFailed(false); };
  return <Dialog title={marker.title[locale]} onClose={onClose} wide>
    <div className="details-content">
      {media && <div className="gallery" onKeyDown={e => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); change(e.key === 'ArrowLeft' ? -1 : 1); }
      }}>
        {media.kind === 'image' ? failed ? <p role="alert">{t.imageError}</p> : <img src={assetUrl(media.assetId)} alt={media.alt[locale]} onError={() => setFailed(true)} />
          : <iframe src={`https://www.youtube-nocookie.com/embed/${media.externalId}`} title={media.title[locale]} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />}
        {marker.media.length > 1 && <div className="gallery-controls">
          <button className="icon-button" aria-label={t.previous} onClick={() => change(-1)}><Icon name="back" /></button>
          <span aria-live="polite">{index + 1} / {marker.media.length}</span>
          <button className="icon-button" aria-label={t.next} onClick={() => change(1)}><Icon name="chevron" /></button>
        </div>}
        <p className="caption">{media.title[locale]}</p>
      </div>}
      <p className="editorial-text">{marker.description[locale]}</p>
    </div><footer className="dialog-footer"><LanguageSelector /><button onClick={onClose}>{t.close}</button></footer>
  </Dialog>;
}
