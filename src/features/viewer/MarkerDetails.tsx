import { useState } from 'react';
import type { Marker } from '../../../shared/model';
import { Dialog } from '../../components/Dialog';
import { Icon } from '../../components/Icon';
import { useLanguage } from '../../i18n/Language';

export function MarkerDetails({ marker, assetUrl, onClose }: { marker: Marker; assetUrl: (id: string) => string; onClose: () => void }) {
  const { locale, t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const media = marker.media[index];
  const change = (delta: number) => { setIndex(i => (i + delta + marker.media.length) % marker.media.length); setFailed(false); };
  return <Dialog title={marker.title[locale]} onClose={onClose} wide className="marker-details-dialog">
    <div className="details-content">
      <div className="marker-media-sticky">
        {media && <div className="gallery marker-gallery" onKeyDown={e => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); change(e.key === 'ArrowLeft' ? -1 : 1); }
        }}>
          {media.kind === 'image' ? failed ? <p role="alert">{t.imageError}</p> : <img src={assetUrl(media.assetId)} alt="" onError={() => setFailed(true)} />
            : <video src={assetUrl(media.assetId)} controls preload="metadata" />}
          {marker.media.length > 1 && <>
            <button className="gallery-arrow gallery-arrow-prev" aria-label={t.previous} onClick={() => change(-1)}><Icon name="back" /></button>
            <button className="gallery-arrow gallery-arrow-next" aria-label={t.next} onClick={() => change(1)}><Icon name="chevron" /></button>
          </>}
        </div>}
        {marker.media.length > 1 && <div className="gallery-dots" aria-label="Posición en la galería">
          {marker.media.map((item, mediaIndex) => <button key={item.id} className="gallery-dot" type="button" aria-label={`Ir al archivo ${mediaIndex + 1}`} aria-current={mediaIndex === index} onClick={() => { setIndex(mediaIndex); setFailed(false); }} />)}
        </div>}
      </div>
      <div className="marker-detail-copy">
        <p>{marker.description[locale]}</p>
      </div>
    </div>
  </Dialog>;
}
