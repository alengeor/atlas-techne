import { useEffect, useState, type CSSProperties } from 'react';
import { mapSchema, type MapDocument } from '../../shared/model';
import type { MapRecord, Session } from '../../shared/api';
import { api, assetUrl } from '../api/client';
import { Icon } from '../components/Icon';
import { Dialog } from '../components/Dialog';
import { LanguageSelector, useLanguage } from '../i18n/Language';
import { apiMessage } from '../i18n/apiErrors';
import { LayerForm } from '../features/editor/LayerForm';
import { MapScreen } from '../features/viewer/MapScreen';
import { Login } from '../features/auth/Login';
import { identity } from './identity';

function routeId(): string | null { return /^#\/maps\/([^/]+)$/.exec(window.location.hash)?.[1] ?? null; }
export function App() {
  const { locale, t } = useLanguage();
  const [records, setRecords] = useState<MapRecord[]>([]);
  const [working, setWorking] = useState(new Map<string, MapDocument>());
  const [session, setSession] = useState<Session>({ user: null });
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [mapId, setMapId] = useState(routeId);
  const [editing, setEditing] = useState(false);
  const [access, setAccess] = useState(false);
  const [create, setCreate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [confirmation, setConfirmation] = useState<'logout' | 'reload' | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void Promise.all([api.session(controller.signal), api.catalog(controller.signal)]).then(([nextSession, nextRecords]) => {
      setSession(nextSession); setEditing(!!nextSession.user); setRecords(nextRecords); setStatus('ready');
    }).catch(failure => { if (!controller.signal.aborted) { setError(failure); setStatus('error'); } });
    return () => controller.abort();
  }, [attempt]);
  useEffect(() => {
    const handler = () => { setMapId(routeId()); setError(null); };
    window.addEventListener('hashchange', handler); return () => window.removeEventListener('hashchange', handler);
  }, []);
  useEffect(() => {
    if (!working.size) return;
    const handler = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', handler); return () => window.removeEventListener('beforeunload', handler);
  }, [working.size]);
  const record = records.find(r => r.map.id === mapId);
  const map = record ? working.get(record.map.id) ?? record.map : undefined;
  const dirty = map && record ? JSON.stringify(map) !== JSON.stringify(record.map) : false;
  const navigate = (id: string | null) => { window.location.hash = id ? `/maps/${id}` : '/'; setMapId(id); setError(null); };
  const update = (value: MapDocument) => {
    const parsed = mapSchema.safeParse(value);
    if (!parsed.success) { setError(parsed.error); return; }
    setWorking(current => new Map(current).set(value.id, parsed.data)); setError(null);
  };
  const acceptRecord = (next: MapRecord) => setRecords(current => current.some(r => r.map.id === next.map.id) ? current.map(r => r.map.id === next.map.id ? next : r) : [...current, next]);
  const saveMap = async () => {
    if (!map || !record) throw new Error('No map selected');
    if (!dirty) return record;
    const snapshot = map;
    const next = await api.save(record, snapshot);
    acceptRecord(next);
    setWorking(current => { const copy = new Map(current); if (copy.get(snapshot.id) === snapshot) copy.delete(snapshot.id); return copy; });
    return next;
  };
  const action = (work: () => Promise<void>) => {
    if (busy) return;
    setBusy(true); setError(null); void work().catch(setError).finally(() => setBusy(false));
  };
  const logout = async () => {
    const next = await api.logout(); setSession(next); setAccess(false); setEditing(false); setWorking(new Map()); setRecords([]); navigate(null);
    setRecords(await api.catalog()); setConfirmation(null);
  };
  const reload = async () => {
    const next = await api.catalog(); setRecords(next);
    if (mapId) setWorking(current => { const copy = new Map(current); copy.delete(mapId); return copy; });
    setConfirmation(null);
  };
  return <>
    <a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); document.querySelector<HTMLElement>('main')?.focus(); }}>{t.canvas}</a>
    <button className={`access-button ${session.user ? 'active' : ''}`} aria-label={t.access} title={t.access} onClick={() => setAccess(true)}><Icon name="settings" /></button>
    {map && record ? <MapScreen key={map.id} map={map} editing={!!session.user && editing} isEditor={!!session.user} onEdit={setEditing} onBack={() => navigate(null)}
      onChange={update} assetUrl={id => assetUrl(map.id, id)}
      onImage={(image, kind, progress) => api.upload(map.id, image.file, kind, progress ?? (() => undefined))}
      published={record.published} saveState={busy ? 'saving' : error ? 'error' : dirty ? 'pending' : 'saved'}
      onSave={() => action(async () => { await saveMap(); })}
      onPublish={() => action(async () => { const saved = await saveMap(); acceptRecord(await api.publish(saved.map.id, saved.revision)); })}
      onReload={() => { if (dirty) setConfirmation('reload'); else action(reload); }} />
      : <main className="landing" id="main-content" tabIndex={-1} style={{ '--landing-background': `url("${identity.background}")` } as CSSProperties}>
        <div className="landing-backdrop" /><section className="catalog-panel surface">
          <header className="catalog-heading"><p className="eyebrow">{t.subtitle}</p><h1>ATLAS TECHNĒ</h1><p>{t.choose}</p></header>
          {status === 'loading' && <div className="catalog-state" role="status"><span className="spinner" />{t.loading}</div>}
          {status === 'error' && <div className="catalog-state" role="alert"><p>{apiMessage(error, t)}</p><button onClick={() => { setStatus('loading'); setAttempt(v => v + 1); }}>{t.retry}</button></div>}
          {status === 'ready' && mapId && <p role="alert">{t.notFound}</p>}
          {status === 'ready' && <>
            {!records.length && <div className="empty-catalog"><Icon name="layers" /><h2>{session.user ? t.noEditorMaps : t.noMaps}</h2>{session.user && <p>{t.noEditorMapsHelp}</p>}</div>}
            <div className="catalog-grid">{records.map(item => <button className="map-card" key={item.map.id} onClick={() => navigate(item.map.id)}>
              <div className="card-image"><img src={assetUrl(item.map.id, item.map.layers[0]?.assetId ?? '', true)} alt="" /><span className="card-open"><Icon name="chevron" /></span></div>
              <div className="card-content">{session.user && <span className="card-kicker">{item.published ? t.published : t.draft}</span>}<h2>{item.map.title[locale] || item.map.title.es}</h2><p>{item.map.description[locale]}</p><span className="card-bottom">{item.map.layers.length} {t.layerCount}<span>{session.user ? t.edit : t.explore} ↗</span></span></div>
            </button>)}
            {session.user && <button className="map-card add-card" onClick={() => setCreate(true)}><span className="add-symbol"><Icon name="plus" /></span><h2>{t.newMap}</h2><p>{t.createMapHelp}</p><span className="card-bottom">PNG · JPG · WebP</span></button>}
            </div>
          </>}
          {session.user && <footer className="catalog-footer"><Icon name="edit" /><span>{t.editor} · {session.user.username}</span></footer>}
        </section><div className="landing-language"><LanguageSelector /></div><img className="museum-logo" src={identity.logo} alt={identity.logoAlt} />
      </main>}
    {access && !session.user && <Login onClose={() => setAccess(false)} onSession={next => {
      setSession(next); setEditing(true); setAccess(false);
      action(async () => {
        const loaded = await api.catalog();
        setRecords(current => loaded.map(remote => working.has(remote.map.id) ? current.find(r => r.map.id === remote.map.id) ?? remote : remote));
        setStatus('ready');
      });
    }} />}
    {access && session.user && <Dialog title={`${t.editor} · ${session.user.username}`} onClose={() => setAccess(false)}><div className="dialog-body"><div className="stack-actions">
      <button className="primary" onClick={() => { setAccess(false); setEditing(true); }}>{t.returnEditor}</button>
      {record?.published && <button onClick={() => action(async () => { acceptRecord(await api.unpublish(record.map.id, record.revision)); setAccess(false); })}>{t.unpublish}</button>}
      <button disabled={busy} onClick={() => { if (working.size) { setAccess(false); setConfirmation('logout'); } else action(logout); }}>{t.logout}</button>
    </div></div></Dialog>}
    {confirmation && <Dialog title={t.discardChanges} onClose={() => setConfirmation(null)}><footer className="dialog-footer"><button onClick={() => setConfirmation(null)}>{t.cancel}</button><button className="danger" onClick={() => action(confirmation === 'logout' ? logout : reload)}>{confirmation === 'logout' ? t.logout : t.reloadSaved}</button></footer></Dialog>}
    {create && session.user && <LayerForm newMap onClose={() => setCreate(false)} onApply={async (image, title, _kind, progress) => {
      const next = await api.create(title, image.file, progress); acceptRecord(next); setCreate(false); navigate(next.map.id); setEditing(true);
    }} />}
    {error !== null && status !== 'error' && <div className="operation-error surface" role="alert"><p>{apiMessage(error, t)}</p><button onClick={() => setError(null)}>{t.close}</button><button onClick={() => setAccess(true)}>{t.access}</button></div>}
  </>;
}
