import { useEffect, useReducer, useRef, useState } from 'react';
import { initialLayers, localized, orderedLayers, removeMapLayer, toggleLayer, type Appearance, type MapAsset, type MapDocument, type Marker, type MarkerCategory } from '../../../shared/model';
import { Icon } from '../../components/Icon';
import { Dialog } from '../../components/Dialog';
import { LocalizedFields } from '../../components/LocalizedFields';
import { LanguageSelector, useLanguage } from '../../i18n/Language';
import { MapCanvas } from './MapCanvas';
import { MarkerDetails } from './MarkerDetails';
import { AppearancePicker } from '../editor/AppearancePicker';
import { MarkerEditor } from '../editor/MarkerEditor';
import { MarkerCategoryForm } from '../editor/MarkerCategoryForm';
import { LayerForm } from '../editor/LayerForm';
import { toolReducer } from '../editor/tool';
import type { LocalImage } from '../assets/readImage';

type Panel = 'base' | 'layers' | 'categories' | 'edit' | 'markers';
export function MapScreen({ map, editing, onEdit, onChange, onImage, assetUrl, onBack, saveState, published, onSave, onPublish, onReload, isEditor }: {
  map: MapDocument; editing: boolean; onEdit: (value: boolean) => void;
  onChange: (map: MapDocument) => void; onImage: (image: LocalImage, kind: 'layers' | 'icons' | 'markers', progress?: (percent: number) => void) => Promise<MapAsset>;
  assetUrl: (id: string) => string; onBack: () => void;
  saveState: 'saved' | 'pending' | 'saving' | 'error'; published: boolean; isEditor: boolean;
  onSave: () => void; onPublish: () => void; onReload: () => void;
}) {
  const { locale, t } = useLanguage();
  const [active, setActive] = useState(() => initialLayers(map));
  const [activeCategories, setActiveCategories] = useState(() => map.markerCategories.filter(category => category.visibleByDefault).map(category => category.id));
  const [panel, setPanel] = useState<Panel | null>(editing ? 'edit' : null);
  const [tool, dispatch] = useReducer(toolReducer, { mode: 'select' });
  const [appearance, setAppearance] = useState<Appearance>({ kind: 'system', icon: 'pin', color: '#e6b65e' });
  const [selected, setSelected] = useState<string | null>(null);
  const [layerForm, setLayerForm] = useState(false);
  const [metadata, setMetadata] = useState(false);
  const [categoryForm, setCategoryForm] = useState<MarkerCategory | 'new' | null>(null);
  const [infoOpen, setInfoOpen] = useState(true);
  const panelButton = useRef<HTMLButtonElement>(null);
  const previousEditing = useRef(editing);
  useEffect(() => {
    if (previousEditing.current === editing) return;
    previousEditing.current = editing;
    setPanel(editing ? 'edit' : null); dispatch({ type: 'cancel' }); setSelected(null);
  }, [editing]);
  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.querySelector('dialog[open]')) {
        if (tool.mode === 'placing') dispatch({ type: 'cancel' });
        else { setPanel(null); panelButton.current?.focus(); }
      }
    };
    window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape);
  }, [tool.mode]);
  const commit = (next: MapDocument) => { onChange(next); };
  const customIcons = map.assets.filter(a => a.path.includes('/icons/')).map(a => a.id);
  const addIcon = async (image: LocalImage) => {
    const asset = await onImage(image, 'icons');
    commit({ ...map, assets: [...map.assets, asset] });
    return asset.id;
  };
  const arm = (next: Appearance) => { setAppearance(next); dispatch({ type: 'arm', appearance: next }); };
  const marker = map.markers.find(m => m.id === selected);
  const provisional: Marker | undefined = tool.mode === 'inspecting' ? {
    id: 'provisional', position: tool.position, appearance: tool.appearance, title: localized(), description: localized(), media: [], visible: true, layerIds: [], labelPosition: 'south', labelDistance: 3,
  } : undefined;
  const editorMarker = provisional ?? (editing ? marker : undefined);
  const hasAlternativeBases = map.layers.filter(layer => layer.kind === 'base').length > 1;
  const hasOverlays = map.layers.some(layer => layer.kind === 'overlay');
  const tabs: Panel[] = editing ? ['base', 'layers', 'categories', 'edit', 'markers'] : [
    ...(hasAlternativeBases ? ['base' as const] : []),
    ...(hasOverlays ? ['layers' as const] : []),
    ...(map.markerCategories.length ? ['categories' as const] : []),
  ];
  const closeEditor = () => { dispatch({ type: 'cancel' }); setSelected(null); };
  const reorder = (id: string, delta: number) => {
    const layers = orderedLayers(map.layers); const index = layers.findIndex(l => l.id === id); const other = layers[index + delta]; const current = layers[index];
    if (!other || !current) return;
    layers[index] = other; layers[index + delta] = current;
    commit({ ...map, layers: layers.map((l, order) => ({ ...l, order })) });
  };
  return <main className="map-screen" id="main-content" tabIndex={-1}>
    <MapCanvas map={map} active={active} activeCategories={activeCategories} assetUrl={assetUrl} placing={editing && tool.mode === 'placing'}
      editing={editing}
      onPlace={position => dispatch({ type: 'place', position, dragged: false })}
      provisional={provisional} onMarker={m => { if (tool.mode === 'placing') return; setSelected(m.id); }}
      onMarkerMove={(id, position) => commit({ ...map, markers: map.markers.map(m => m.id === id ? { ...m, position } : m) })}
      onMarkerDelete={id => commit({ ...map, markers: map.markers.filter(m => m.id !== id) })} />
    <div className="map-topline"><span className="wordmark-small">ATLAS AUSTRAL</span>{isEditor && <span className="session-badge">{editing ? t.editor : t.previewDraft}</span>}</div>
    {isEditor && <div className="editor-status surface"><span aria-live="polite">{saveState === 'saving' ? t.saving : saveState === 'pending' || saveState === 'error' ? t.pending : t.saved}</span><button onClick={() => onEdit(!editing)}><Icon name="fit" />{editing ? t.preview : t.returnEditor}</button></div>}
    <aside className={`map-info-group ${infoOpen ? '' : 'collapsed'}`}>
      <LanguageSelector />
      <section className="map-info surface">
        <div className="info-actions"><button onClick={onBack}><Icon name="back" />{t.back}</button><button className="icon-button" aria-label={infoOpen ? t.hideInfo : t.showInfo} onClick={() => setInfoOpen(v => !v)}><Icon name={infoOpen ? 'down' : 'up'} /></button></div>
        {infoOpen && <><h1>{map.title[locale]}</h1><p>{map.description[locale]}</p><div className="map-summary"><span><Icon name="layers" />{map.layers.length} {t.layerCount}</span><span><Icon name="pin" />{map.markers.length} {t.markerCount}</span></div></>}
      </section>
    </aside>
    {!panel && (editing || tabs.length > 0) && <button ref={panelButton} className="panel-trigger surface" onClick={() => setPanel(editing ? 'edit' : tabs[0] ?? null)}><Icon name="layers" />{t.layers}</button>}
    {panel && <aside className="map-panel surface" aria-label={t.layers}>
      <div className="panel-header"><div className="panel-tabs">
        {tabs.map(tab => <button key={tab} aria-pressed={panel === tab} onClick={() => setPanel(tab)}>{tab === 'base' ? t.baseLayers : tab === 'layers' ? t.overlays : tab === 'categories' ? t.markerCategories : tab === 'edit' ? t.edit : t.markers}</button>)}
      </div><button className="icon-button" aria-label={t.close} onClick={() => { setPanel(null); panelButton.current?.focus(); }}><Icon name="close" /></button></div>
      <div className="panel-body">
        {(panel === 'base' || panel === 'layers') && <>
          <p className="muted panel-intro">{t.aboutLayers}</p>
          {orderedLayers(map.layers).filter(l => l.kind === (panel === 'base' ? 'base' : 'overlay')).map(layer => <div className="layer-row" key={layer.id}>
            <label className="layer-choice"><input type={layer.kind === 'base' ? 'radio' : 'checkbox'} name="base-layer" checked={active.includes(layer.id)} onChange={() => setActive(current => toggleLayer(map.layers, current, layer))} />
              <span className="layer-thumb"><img src={assetUrl(layer.assetId)} alt="" loading="lazy" /></span><span>{layer.title[locale]}</span>
            </label>
            {editing && <><div className="layer-edit"><label>{t.opacity}<input aria-label={`${t.opacity} ${layer.title[locale]}`} type="range" min="0" max="1" step="0.05" value={layer.transform.opacity} onChange={e => commit({ ...map, layers: map.layers.map(l => l.id === layer.id ? { ...l, transform: { ...l.transform, opacity: Number(e.target.value) } } : l) })} /></label>
              <button className="icon-button" title={t.moveUp} aria-label={`${t.moveUp}: ${layer.title[locale]}`} disabled={orderedLayers(map.layers)[0]?.id === layer.id} onClick={() => reorder(layer.id, -1)}><Icon name="up" /></button>
              <button className="icon-button" title={t.moveDown} aria-label={`${t.moveDown}: ${layer.title[locale]}`} disabled={orderedLayers(map.layers).at(-1)?.id === layer.id} onClick={() => reorder(layer.id, 1)}><Icon name="down" /></button>
              <button className="icon-button danger-quiet" title={t.delete} aria-label={`${t.delete}: ${layer.title[locale]}`} onClick={() => {
                try {
                  const next = removeMapLayer(map, layer.id);
                  commit(next);
                  setActive(current => current.filter(id => id !== layer.id));
                } catch {
                  // no-op: prevent deleting the last base layer
                }
              }}><Icon name="trash" /></button>
            </div><details className="layer-transform"><summary>{t.transform}</summary>
              <LocalizedFields title={layer.title} onTitle={title => commit({ ...map, layers: map.layers.map(l => l.id === layer.id ? { ...l, title, alt: title } : l) })} />
              <div className="coordinate-fields">{(['scale', 'x', 'y'] as const).map(field => <label key={field}>{field === 'scale' ? t.scale : field === 'x' ? t.offsetX : t.offsetY}
                <input type="number" step={field === 'scale' ? 0.05 : 1} min={field === 'scale' ? 0.05 : -200} max={field === 'scale' ? 10 : 200} value={field === 'scale' ? layer.transform[field] : Math.round(layer.transform[field] * 100)} onChange={e => {
                  const n = e.target.valueAsNumber; if (!Number.isFinite(n)) return;
                  const value = field === 'scale' ? Math.max(.05, Math.min(10, n)) : Math.max(-2, Math.min(2, n / 100));
                  commit({ ...map, layers: map.layers.map(l => l.id === layer.id ? { ...l, transform: { ...l.transform, [field]: value } } : l) });
                }} /></label>)}</div>
            </details></>}
          </div>)}
          {panel === 'layers' && !map.layers.some(l => l.kind === 'overlay') && <p>{t.emptyLayers}</p>}
          {editing && <button className="wide-button" onClick={() => setLayerForm(true)}><Icon name="plus" />{t.addLayer}</button>}
        </>}
        {panel === 'categories' && <>
          <p className="muted panel-intro">{t.categoriesHelp}</p>
          {map.markerCategories.map(category => <div className="layer-row category-row" key={category.id}>
            <label className="layer-choice category-choice"><input type="checkbox" checked={activeCategories.includes(category.id)} onChange={() => setActiveCategories(current => current.includes(category.id) ? current.filter(id => id !== category.id) : [...current, category.id])} /><span className="category-dot" style={{ backgroundColor: category.color }} aria-hidden="true" /><span>{category.title[locale] || category.title.es}</span></label>
            {editing && <div className="layer-edit"><button className="icon-button" title={t.editCategory} aria-label={`${t.editCategory}: ${category.title[locale] || category.title.es}`} onClick={() => setCategoryForm(category)}><Icon name="edit" /></button><button className="icon-button danger-quiet" title={t.delete} aria-label={`${t.delete}: ${category.title[locale] || category.title.es}`} onClick={() => {
              commit({ ...map, markerCategories: map.markerCategories.filter(item => item.id !== category.id), markers: map.markers.map(marker => marker.categoryId === category.id ? { ...marker, categoryId: undefined } : marker) });
              setActiveCategories(current => current.filter(id => id !== category.id));
            }}><Icon name="trash" /></button></div>}
          </div>)}
          {!map.markerCategories.length && <p>{t.noCategories}</p>}
          {editing && <button className="wide-button" onClick={() => setCategoryForm('new')}><Icon name="plus" />{t.addCategory}</button>}
        </>}
        {panel === 'edit' && editing && <>
          <AppearancePicker value={appearance} onChange={arm} customIcons={customIcons} onImage={addIcon} assetUrl={assetUrl} />
          {tool.mode === 'placing' && <p className="placing-help" role="status">{t.placing}</p>}
          <div className="stack-actions"><button onClick={() => { dispatch({ type: 'arm', appearance }); dispatch({ type: 'place', position: { x: 0.5, y: 0.5 }, dragged: false }); }}><Icon name="pin" />{t.placeKeyboard}</button>
            <button onClick={() => setLayerForm(true)}><Icon name="plus" />{t.addLayer}</button>
            <button onClick={() => setMetadata(true)}><Icon name="edit" />{t.editMap}</button></div>
        </>}
        {panel === 'markers' && <div className="marker-list">{map.markers.map(m => <button key={m.id} onClick={() => { dispatch({ type: 'cancel' }); setSelected(m.id); }}><Icon name="pin" /><span>{m.title[locale]}</span><Icon name="chevron" /></button>)}{!map.markers.length && <p>{t.noMarkers}</p>}</div>}
      </div>
      {editing && <footer className="panel-footer save-footer"><span>{published ? t.published : t.draft}</span><button className="primary" disabled={saveState === 'saving' || saveState === 'saved'} onClick={onSave}>{saveState === 'saving' ? t.saving : t.save}</button><button disabled={saveState === 'saving'} onClick={onPublish}>{t.publish}</button><button className="icon-button" title={t.reloadSaved} aria-label={t.reloadSaved} onClick={onReload}><Icon name="reset" /></button></footer>}
    </aside>}
    {!panel && !editing && <div className="interaction-hint surface"><Icon name="info" /><span>{t.hint}</span></div>}
    {tool.mode === 'placing' && <div className="placement-banner surface"><span>{t.placing}</span><button onClick={() => dispatch({ type: 'cancel' })}>{t.cancel}</button></div>}
    {editorMarker && <MarkerEditor key={provisional ? 'new' : marker?.id} marker={editorMarker} categories={map.markerCategories} isNew={!!provisional} customIcons={customIcons} assetUrl={assetUrl} onImage={addIcon} onMediaUpload={async image => {
      const asset = await onImage(image, 'markers');
      commit({ ...map, assets: [...map.assets, asset] });
      return asset.id;
    }} onClose={closeEditor}
      onApply={next => { commit({ ...map, markers: provisional ? [...map.markers, { ...next, id: crypto.randomUUID() }] : map.markers.map(m => m.id === next.id ? next : m) }); closeEditor(); }}
      onDelete={() => { commit({ ...map, markers: map.markers.filter(m => m.id !== selected) }); closeEditor(); }} />}
    {categoryForm && <MarkerCategoryForm key={categoryForm === 'new' ? 'new' : categoryForm.id} category={categoryForm === 'new' ? undefined : categoryForm} onClose={() => setCategoryForm(null)} onApply={category => {
      const exists = map.markerCategories.some(item => item.id === category.id);
      commit({ ...map, markerCategories: exists ? map.markerCategories.map(item => item.id === category.id ? category : item) : [...map.markerCategories, category] });
      if (!exists && category.visibleByDefault) setActiveCategories(current => [...current, category.id]);
      setCategoryForm(null);
    }} />}
    {!editing && marker && <MarkerDetails marker={marker} assetUrl={assetUrl} onClose={() => setSelected(null)} />}
    {layerForm && <LayerForm onClose={() => setLayerForm(false)} onApply={async (image, title, kind, progress) => {
      const asset = await onImage(image, 'layers', progress); const id = crypto.randomUUID();
      commit({ ...map, assets: [...map.assets, asset], layers: [...map.layers, { id, title, alt: title, assetId: asset.id, kind, visibleByDefault: false, order: map.layers.length, transform: { scale: 1, x: 0, y: 0, opacity: 1 } }] });
      setActive(current => kind === 'base' ? [...current.filter(id => map.layers.find(l => l.id === id)?.kind !== 'base'), id] : [...current, id]); setLayerForm(false); setPanel(kind === 'base' ? 'base' : 'layers');
    }} />}
    {metadata && <MetadataForm map={map} onClose={() => setMetadata(false)} onApply={next => { commit(next); setMetadata(false); }} />}
  </main>;
}

export function MetadataForm({ map, onClose, onApply, onDelete }: { map: MapDocument; onClose: () => void; onApply: (map: MapDocument) => void; onDelete?: () => void }) {
  const { t } = useLanguage(); const [title, setTitle] = useState(map.title); const [description, setDescription] = useState(map.description);
  const [confirmDelete, setConfirmDelete] = useState(false);
  return <Dialog title={t.editMap} onClose={onClose}>
    {confirmDelete ? <div className="dialog-body"><p>{t.confirmDeleteMap}</p></div> : <form id="meta-form" onSubmit={e => { e.preventDefault(); onApply({ ...map, title, description }); }}><div className="dialog-body"><LocalizedFields title={title} description={description} onTitle={setTitle} onDescription={setDescription} /></div></form>}
    <footer className="dialog-footer">
       {confirmDelete ? <div className="button-row"><button type="button" onClick={() => setConfirmDelete(false)}>{t.cancel}</button><button className="danger" type="button" onClick={onDelete}>{t.delete}</button></div>
       : <>{onDelete && <button className="danger-quiet" type="button" onClick={() => setConfirmDelete(true)}>{t.delete}</button>}
         <div className="button-row">
           <button type="button" onClick={onClose}>{t.cancel}</button>
           <button form="meta-form" type="submit" className="primary" disabled={Object.values(title).some(v => !v.trim())}>{t.apply}</button>
         </div></>}
    </footer>
  </Dialog>;
}
