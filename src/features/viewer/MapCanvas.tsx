import { useState, useRef } from 'react';
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
export function MapCanvas({ map, active, assetUrl, onMarker, placing, onPlace, provisional, editing, onMarkerMove, onMarkerDelete }: {
  map: MapDocument; active: string[]; assetUrl: (id: string) => string; onMarker: (marker: Marker) => void;
  placing: boolean; onPlace: (point: Point) => void; provisional?: { position: Point; appearance: Appearance };
  editing?: boolean; onMarkerMove?: (id: string, point: Point) => void; onMarkerDelete?: (id: string) => void;
}) {
  const { locale, t } = useLanguage();
  const { viewport, world, rect, getImagePoint } = useViewport(map, placing ? onPlace : undefined);
  const [fullscreenError, setFullscreenError] = useState(false);
  const [dragState, setDragState] = useState<{ id: string, x: number, y: number } | null>(null);
  const [trashHover, setTrashHover] = useState(false);
  const dragRef = useRef({ moved: false });
  return <>
    <div className={`canvas-viewport ${placing ? 'is-placing' : ''}`} ref={viewport} tabIndex={0} role="region" aria-label={t.canvas} aria-describedby="canvas-help">
      <span id="canvas-help" className="sr-only">{t.canvasHelp}</span>
      <div className="canvas-world" ref={world} data-testid="canvas-world" style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}>
        {orderedLayers(map.layers).filter(l => active.includes(l.id)).map(layer => {
          const asset = map.assets.find(a => a.id === layer.assetId);
          const box = contain({ width: rect.width, height: rect.height }, asset ?? map);
          return <LayerImage key={`${layer.id}-${layer.assetId}`} src={assetUrl(layer.assetId)} alt={layer.alt[locale]} style={{ left: box.x + layer.transform.x * rect.width, top: box.y + layer.transform.y * rect.height, width: box.width, height: box.height, opacity: layer.transform.opacity, transform: `scale(${layer.transform.scale})` }} />;
        })}
        {map.markers.filter(m => m.visible && (!m.layerIds.length || m.layerIds.some(id => active.includes(id)))).map(marker => {
          const isDragged = dragState?.id === marker.id;
          return <button key={marker.id} className="map-marker"
            style={isDragged ? { left: dragState.x, top: dragState.y, position: 'fixed', transform: 'translate(-50%, -100%) scale(1)' } : { left: `${marker.position.x * 100}%`, top: `${marker.position.y * 100}%` }}
            onClick={e => { if (dragRef.current.moved) { e.preventDefault(); e.stopPropagation(); return; } onMarker(marker); }} aria-label={marker.title[locale]}
            onPointerDown={e => {
              if (!editing) return;
              if (e.button !== 0) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              dragRef.current.moved = false;
              setDragState({ id: marker.id, x: e.clientX, y: e.clientY });
            }}
            onPointerMove={e => {
              if (dragState?.id === marker.id && e.currentTarget.hasPointerCapture(e.pointerId)) {
                dragRef.current.moved = true;
                setDragState({ id: marker.id, x: e.clientX, y: e.clientY });
                const trashRect = document.getElementById('trash-zone')?.getBoundingClientRect();
                if (trashRect) {
                  const inTrash = e.clientX >= trashRect.left && e.clientX <= trashRect.right && e.clientY >= trashRect.top && e.clientY <= trashRect.bottom;
                  setTrashHover(inTrash);
                }
              }
            }}
            onPointerUp={e => {
              if (dragState?.id === marker.id) {
                e.currentTarget.releasePointerCapture(e.pointerId);
                const wasMoved = dragRef.current.moved;
                const wasTrash = trashHover;
                setDragState(null);
                setTrashHover(false);
                if (wasMoved) {
                  if (wasTrash) {
                    onMarkerDelete?.(marker.id);
                  } else {
                    const pt = getImagePoint(e.clientX, e.clientY);
                    if (pt) onMarkerMove?.(marker.id, pt);
                  }
                }
                setTimeout(() => { dragRef.current.moved = false; }, 0);
              }
            }}>
            <span className="marker-content"><MarkerSymbol appearance={marker.appearance} assetUrl={assetUrl} /><span className="marker-label">{marker.title[locale]}</span></span>
          </button>;
        })}
        {provisional && <div className="map-marker provisional" style={{ left: `${provisional.position.x * 100}%`, top: `${provisional.position.y * 100}%` }}><span className="marker-content"><MarkerSymbol appearance={provisional.appearance} assetUrl={assetUrl} /></span></div>}
      </div>
    </div>
    {fullscreenError && <div role="alert" className="toast actionable surface">{t.fullscreenError}<button onClick={() => setFullscreenError(false)}>{t.close}</button></div>}
    {editing && <div id="trash-zone" className={`trash-zone ${dragState ? 'visible' : ''} ${trashHover ? 'hover' : ''}`}><Icon name="trash" /></div>}
  </>;
}
