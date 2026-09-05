import { useState } from 'react';
import { orderedLayers, type MapDocument, type Marker, type Appearance } from '../../../shared/model';
import { useViewport } from '../../canvas/useViewport';
import type { Point } from '../../canvas/geometry';
import { contain } from '../../canvas/geometry';
import { Icon } from '../../components/Icon';
import { useLanguage } from '../../i18n/Language';

export function MarkerSymbol({ appearance, assetUrl }: { appearance: Appearance; assetUrl: (id: string) => string }) {
  return appearance.kind === 'system' ? <Icon name={appearance.icon} style={{ color: appearance.color }} /> : <img src={assetUrl(appearance.assetId)} alt="" draggable={false} />;
}
function LayerImage({ src, alt, style }: { src: string; alt: string; style: React.CSSProperties }) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  return <><img key={attempt} className="layer-image" src={src} alt={alt} draggable={false} style={style} onLoad={() => setStatus('ready')} onError={() => setStatus('error')} />
    {status !== 'ready' && <div className="image-status" role="status">{status === 'loading' ? t.loading : <>{t.imageError}<button onClick={() => { setStatus('loading'); setAttempt(a => a + 1); }}>{t.retry}</button></>}</div>}
  </>;
}
export function MapCanvas({ map, active, assetUrl, onMarker, placing, onPlace, provisional }: {
  map: MapDocument; active: string[]; assetUrl: (id: string) => string; onMarker: (marker: Marker) => void;
  placing: boolean; onPlace: (point: Point) => void; provisional?: { position: Point; appearance: Appearance };
}) {
  const { locale, t } = useLanguage();
  const { viewport, world, rect, zoom, zoomBy, reset } = useViewport(map, placing ? onPlace : undefined);
  const [fullscreenError, setFullscreenError] = useState(false);
  return <>
    <div className={`canvas-viewport ${placing ? 'is-placing' : ''}`} ref={viewport} tabIndex={0} role="region" aria-label={t.canvas} aria-describedby="canvas-help">
      <span id="canvas-help" className="sr-only">{t.canvasHelp}</span>
      <div className="canvas-world" ref={world} data-testid="canvas-world" style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}>
        {orderedLayers(map.layers).filter(l => active.includes(l.id)).map(layer => {
          const asset = map.assets.find(a => a.id === layer.assetId);
          const box = contain({ width: rect.width, height: rect.height }, asset ?? map);
          return <LayerImage key={`${layer.id}-${layer.assetId}`} src={assetUrl(layer.assetId)} alt={layer.alt[locale]} style={{ left: box.x + layer.transform.x * rect.width, top: box.y + layer.transform.y * rect.height, width: box.width, height: box.height, opacity: layer.transform.opacity, transform: `scale(${layer.transform.scale})` }} />;
        })}
        {map.markers.filter(m => m.visible && (!m.layerIds.length || m.layerIds.some(id => active.includes(id)))).map(marker =>
          <button key={marker.id} className="map-marker" style={{ left: `${marker.position.x * 100}%`, top: `${marker.position.y * 100}%` }} onClick={() => onMarker(marker)} aria-label={marker.title[locale]}>
            <span className="marker-content"><MarkerSymbol appearance={marker.appearance} assetUrl={assetUrl} /><span className="marker-label">{marker.title[locale]}</span></span>
          </button>)}
        {provisional && <div className="map-marker provisional" style={{ left: `${provisional.position.x * 100}%`, top: `${provisional.position.y * 100}%` }}><span className="marker-content"><MarkerSymbol appearance={provisional.appearance} assetUrl={assetUrl} /></span></div>}
      </div>
    </div>
    <div className="zoom-controls surface" aria-label={t.canvas}>
      <button className="icon-button" aria-label={t.zoomIn} title={t.zoomIn} onClick={() => zoomBy(1.25)} disabled={zoom >= 8}><Icon name="plus" /></button>
      <output aria-live="off">{Math.round(zoom * 100)}%</output>
      <button className="icon-button" aria-label={t.zoomOut} title={t.zoomOut} onClick={() => zoomBy(0.8)} disabled={zoom <= 1}><Icon name="minus" /></button>
      <span className="control-divider" />
      <button className="icon-button" aria-label={t.fit} title={`${t.fit} · 0`} onClick={reset}><Icon name="fit" /></button>
      <button className="icon-button" aria-label={t.reset} title={t.reset} onClick={reset}><Icon name="reset" /></button>
      {document.fullscreenEnabled && <button className="icon-button" aria-label={t.fullscreen} title={t.fullscreen} onClick={() => {
        const action = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
        void action.catch(() => setFullscreenError(true));
      }}><Icon name="fit" /></button>}
    </div>
    {fullscreenError && <div role="alert" className="toast actionable surface">{t.fullscreenError}<button onClick={() => setFullscreenError(false)}>{t.close}</button></div>}
  </>;
}
