import { useState, useRef, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { orderedLayers, type MapDocument, type Marker, type Appearance } from '../../../shared/model';
import { useViewport } from '../../canvas/useViewport';
import type { Point } from '../../canvas/geometry';
import { contain } from '../../canvas/geometry';
import { Icon } from '../../components/Icon';
import { useLanguage } from '../../i18n/Language';

export function MarkerSymbol({ appearance, assetUrl }: { appearance: Appearance; assetUrl: (id: string) => string }) {
  return appearance.kind === 'system' ? <Icon name={appearance.icon} style={{ color: appearance.color }} /> : <img src={assetUrl(appearance.assetId)} alt="" draggable={false} />;
}
function MarkerContent({ marker, locale, assetUrl }: { marker: Marker; locale: 'es' | 'pt' | 'en'; assetUrl: (id: string) => string }) {
  const distance = marker.labelDistance;
  const connector = (() => {
    switch (marker.labelPosition) {
      case 'north': return { x: 0, y: 44 + distance };
      case 'south': return { x: 0, y: -distance };
      case 'east': return { x: -(22 + distance), y: 22 };
      case 'west': return { x: 22 + distance, y: 22 };
      case 'north-east': return { x: -(22 + distance), y: 44 + distance };
      case 'north-west': return { x: 22 + distance, y: 44 + distance };
      case 'south-east': return { x: -(22 + distance), y: -distance };
      case 'south-west': return { x: 22 + distance, y: -distance };
    }
  })();
  const style = {
    '--marker-label-distance': `${distance}px`,
    '--marker-connector-length': `${Math.hypot(connector.x, connector.y) + 2}px`,
    '--marker-connector-angle': `${Math.atan2(connector.y, connector.x) * 180 / Math.PI}deg`,
  } as CSSProperties;
  return <span className="marker-content" data-label-position={marker.labelPosition} style={style}>
    <MarkerSymbol appearance={marker.appearance} assetUrl={assetUrl} />
    <span className="marker-label">{marker.title[locale]}</span>
  </span>;
}
function LayerImage({ src, alt, style }: { src: string; alt: string; style: React.CSSProperties }) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  return <><img key={attempt} className="layer-image" src={src} alt={alt} draggable={false} style={style} onLoad={() => setStatus('ready')} onError={() => setStatus('error')} />
    {status !== 'ready' && <div className="image-status" role="status">{status === 'loading' ? t.loading : <>{t.imageError}<button onClick={() => { setStatus('loading'); setAttempt(a => a + 1); }}>{t.retry}</button></>}</div>}
  </>;
}
export function MapCanvas({ map, active, activeCategories, assetUrl, onMarker, placing, onPlace, provisional, editing, onMarkerMove, onMarkerDelete, drawing, onDrawStart, onDrawPoint }: {
  map: MapDocument; active: string[]; assetUrl: (id: string) => string; onMarker: (marker: Marker) => void;
  activeCategories: string[];
  placing: boolean; onPlace: (point: Point) => void; provisional?: { position: Point; appearance: Appearance };
  drawing?: { strokes: { points: Point[]; color: string; brushSize: number }[]; color: string; brushSize: number }; onDrawStart?: () => void; onDrawPoint?: (point: Point) => void;
  editing?: boolean; onMarkerMove?: (id: string, point: Point) => void; onMarkerDelete?: (id: string) => void;
}) {
  const { locale, t } = useLanguage();
  const { viewport, world, rect, getImagePoint } = useViewport(map, drawing ? onDrawPoint : placing ? onPlace : undefined, !!drawing, onDrawStart);
  const [fullscreenError, setFullscreenError] = useState(false);
  const [dragState, setDragState] = useState<{ id: string, x: number, y: number } | null>(null);
  const [trashHover, setTrashHover] = useState(false);
  const dragRef = useRef({ moved: false });
  const draggedMarker = dragState ? map.markers.find(marker => marker.id === dragState.id) : undefined;
  return <>
    <div className={`canvas-viewport ${placing || drawing ? 'is-placing' : ''}`} ref={viewport} tabIndex={0} role="region" aria-label={t.canvas} aria-describedby="canvas-help">
      <span id="canvas-help" className="sr-only">{t.canvasHelp}</span>
      <div className="canvas-world" ref={world} data-testid="canvas-world" style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}>
        {orderedLayers(map.layers).filter(l => active.includes(l.id)).map(layer => {
          if (layer.type === 'polygon') return <svg key={layer.id} className="layer-shape" viewBox="0 0 1 1" preserveAspectRatio="none" style={{ opacity: layer.transform.opacity }} aria-label={layer.title[locale]}><polygon points={layer.points?.map(point => `${point.x},${point.y}`).join(' ')} fill={layer.color} /></svg>;
          if (layer.type === 'brush') return <svg key={layer.id} className="layer-shape" viewBox="0 0 1 1" preserveAspectRatio="none" style={{ opacity: layer.transform.opacity }} aria-label={layer.title[locale]}>{(layer.strokes ?? (layer.points ? [layer.points] : [])).map((stroke, index) => { const points = Array.isArray(stroke) ? stroke : stroke.points; const color = Array.isArray(stroke) ? layer.color : stroke.color; const brushSize = Array.isArray(stroke) ? layer.brushSize : stroke.brushSize; return <polyline key={index} points={points.map(point => `${point.x},${point.y}`).join(' ')} fill="none" stroke={color} strokeWidth={(brushSize ?? 1) / Math.max(rect.width, rect.height)} strokeLinecap="round" strokeLinejoin="round" />; })}</svg>;
          const asset = map.assets.find(a => a.id === layer.assetId);
          const box = contain({ width: rect.width, height: rect.height }, asset ?? map);
          return <LayerImage key={`${layer.id}-${layer.assetId}`} src={assetUrl(layer.assetId!)} alt={layer.alt[locale]} style={{ left: box.x + layer.transform.x * rect.width, top: box.y + layer.transform.y * rect.height, width: box.width, height: box.height, opacity: layer.transform.opacity, transform: `scale(${layer.transform.scale})` }} />;
        })}
        {drawing && <svg className="layer-shape drawing-shape" viewBox="0 0 1 1" preserveAspectRatio="none">{drawing.strokes.map((stroke, index) => <polyline key={index} points={stroke.points.map(point => `${point.x},${point.y}`).join(' ')} fill="none" stroke={stroke.color} strokeWidth={stroke.brushSize / Math.max(rect.width, rect.height)} strokeLinecap="round" strokeLinejoin="round" />)}</svg>}
        {map.markers.filter(m => m.visible && (!m.categoryId || activeCategories.includes(m.categoryId)) && (!m.layerIds.length || m.layerIds.some(id => active.includes(id)))).map(marker => {
          const isDragged = dragState?.id === marker.id;
          return <button key={marker.id} className="map-marker"
            style={{ left: `${marker.position.x * 100}%`, top: `${marker.position.y * 100}%`, opacity: isDragged ? 0 : undefined }}
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
            <MarkerContent marker={marker} locale={locale} assetUrl={assetUrl} />
          </button>;
        })}
        {provisional && <div className="map-marker provisional" style={{ left: `${provisional.position.x * 100}%`, top: `${provisional.position.y * 100}%` }}><span className="marker-content"><MarkerSymbol appearance={provisional.appearance} assetUrl={assetUrl} /></span></div>}
      </div>
    </div>
    {fullscreenError && <div role="alert" className="toast actionable surface">{t.fullscreenError}<button onClick={() => setFullscreenError(false)}>{t.close}</button></div>}
    {editing && <div id="trash-zone" className={`trash-zone ${dragState ? 'visible' : ''} ${trashHover ? 'hover' : ''}`}><Icon name="trash" /></div>}
    {dragState && draggedMarker && createPortal(
      <div className="map-marker" aria-hidden="true" style={{ left: dragState.x, top: dragState.y, position: 'fixed', transform: 'translate(-50%, -100%) scale(1)', pointerEvents: 'none' }}>
        <MarkerContent marker={draggedMarker} locale={locale} assetUrl={assetUrl} />
      </div>, document.body,
    )}
  </>;
}
