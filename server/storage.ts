import { mkdir, open, readdir, readFile, rename, unlink, realpath, stat, rm } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { assetSchema, localized, locales, mapSchema, type MapDocument, type LocalizedText } from '../shared/model.js';
import type { Change, MapRecord } from '../shared/api.js';
import type { StorageConfig } from './config.js';
import { HttpError } from './errors.js';
import { validateImage } from './images.js';

const storedSchema = z.object({ revision: z.number().int().nonnegative(), map: mapSchema });
const registrySchema = z.array(z.object({ asset: assetSchema, mime: z.string(), originalName: z.string(), thumbnail: z.string() }));
type RegistryEntry = z.infer<typeof registrySchema>[number];
async function readJson(file: string): Promise<unknown> { return JSON.parse(await readFile(file, 'utf8')); }
async function optionalJson(file: string): Promise<unknown> {
  try { return await readJson(file); } catch (error) { if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null; throw error; }
}
async function atomicJson(file: string, value: unknown) {
  const temp = `${file}.${randomUUID()}.tmp`;
  const handle = await open(temp, 'wx');
  try {
    try { await handle.writeFile(JSON.stringify(value, null, 2) + '\n'); await handle.sync(); }
    finally { await handle.close(); }
    await rename(temp, file);
  } catch (error) { await unlink(temp).catch(() => undefined); throw error; }
}
function slug(title: string) {
  const value = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'mapa';
  return /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/.test(value) ? `mapa-${value}` : value;
}
function usedAssets(map: MapDocument) {
  return new Set([...map.layers.map(l => l.assetId), ...map.markers.flatMap(m => [
    ...(m.appearance.kind === 'custom' ? [m.appearance.assetId] : []), ...m.media.flatMap(media => media.kind === 'image' ? [media.assetId] : []),
  ])]);
}
export class MapStorage {
  private queue: Promise<unknown> = Promise.resolve();
  constructor(private config: StorageConfig) {}
  async init() { await mkdir(this.config.dataDir, { recursive: true }); await mkdir(this.config.mediaDir, { recursive: true }); }
  private locked<T>(work: () => Promise<T>): Promise<T> { const next = this.queue.then(work); this.queue = next.catch(() => undefined); return next; }
  private data(folder: string, file: string) { return path.join(this.config.dataDir, folder, file); }
  private async folders() { return (await readdir(this.config.dataDir, { withFileTypes: true })).filter(e => e.isDirectory() && /^[a-z0-9-]+$/.test(e.name)).map(e => e.name); }
  private async find(id: string) {
    for (const folder of await this.folders()) {
      const json = await optionalJson(this.data(folder, 'draft.json'));
      if (!json) continue;
      const stored = storedSchema.parse(json);
      if (stored.map.id === id) return { folder, stored };
    }
    throw new HttpError(404, 'MAP_NOT_FOUND');
  }
  async list(editor: boolean): Promise<MapRecord[]> {
    const records: MapRecord[] = [];
    for (const folder of await this.folders()) {
      const published = await optionalJson(this.data(folder, 'published.json'));
      const data = editor ? await optionalJson(this.data(folder, 'draft.json')) : published;
      if (!data) continue;
      records.push({ ...storedSchema.parse(data), published: !!published });
    }
    return records;
  }
  private async registry(folder: string) { return registrySchema.parse(await optionalJson(this.data(folder, 'assets.json')) ?? []); }
  private async putImage(folder: string, bytes: Buffer, name: string, mime: string, kind: 'layers' | 'icons' | 'markers'): Promise<RegistryEntry> {
    const image = await validateImage(bytes, name, mime, kind === 'icons');
    const id = randomUUID();
    const relative = `${folder}/${kind}/${id}.${image.extension}`;
    const thumbnail = `${folder}/thumbnails/${id}.webp`;
    const output = path.join(this.config.mediaDir, relative);
    const thumbOutput = path.join(this.config.mediaDir, thumbnail);
    await mkdir(path.dirname(output), { recursive: true }); await mkdir(path.dirname(thumbOutput), { recursive: true });
    const write = async (file: string, data: Buffer) => { const handle = await open(file, 'wx'); try { await handle.writeFile(data); await handle.sync(); } finally { await handle.close(); } };
    try {
      await write(output, image.bytes); await write(thumbOutput, image.thumbnail);
      const entry: RegistryEntry = { asset: { id, path: relative, width: image.width, height: image.height }, mime: image.mime, originalName: path.basename(name), thumbnail };
      await atomicJson(this.data(folder, 'assets.json'), [...await this.registry(folder), entry]);
      return entry;
    } catch (error) { await unlink(output).catch(() => undefined); await unlink(thumbOutput).catch(() => undefined); throw error; }
  }
  async create(title: LocalizedText, bytes: Buffer, name: string, mime: string): Promise<MapRecord> {
    if (!title.es.trim()) throw new HttpError(400, 'TITLE_REQUIRED');
    // Validate before creating a folder, so rejected uploads leave no map behind.
    await validateImage(bytes, name, mime);
    return this.locked(async () => {
      const existing = new Set((await this.folders()).map(f => f.toLowerCase()));
      let folder = slug(title.es);
      if (existing.has(folder)) folder += `-${randomUUID().slice(0, 8)}`;
      await mkdir(path.join(this.config.dataDir, folder));
      const entry = await this.putImage(folder, bytes, name, mime, 'layers');
      const map = mapSchema.parse({
        schemaVersion: 1, id: randomUUID(), title, description: localized(), width: entry.asset.width, height: entry.asset.height,
        assets: [entry.asset], markers: [], layers: [{ id: randomUUID(), assetId: entry.asset.id, title, alt: title, kind: 'base', order: 0, visibleByDefault: true, transform: { scale: 1, x: 0, y: 0, opacity: 1 } }],
      });
      const stored = { map, revision: 1 };
      await atomicJson(this.data(folder, 'draft.json'), stored);
      return { ...stored, published: false };
    });
  }
  async upload(id: string, bytes: Buffer, name: string, mime: string, kind: 'layers' | 'icons' | 'markers') {
    return this.locked(async () => { const { folder } = await this.find(id); return (await this.putImage(folder, bytes, name, mime, kind)).asset; });
  }
  async save(id: string, revision: number, changes: Change[]): Promise<MapRecord> {
    return this.locked(async () => {
      const { folder, stored } = await this.find(id);
      if (revision !== stored.revision) throw new HttpError(409, 'REVISION_CONFLICT');
      const map = structuredClone(stored.map);
      const registry = await this.registry(folder);
      for (const change of changes) {
        switch (change.type) {
          case 'metadata': map.title = change.title; map.description = change.description; break;
          case 'layer.upsert': { const index = map.layers.findIndex(l => l.id === change.value.id); if (index < 0) map.layers.push(change.value); else map.layers[index] = change.value; break; }
          case 'layer.remove': map.layers = map.layers.filter(l => l.id !== change.id); break;
          case 'marker.upsert': { const index = map.markers.findIndex(m => m.id === change.value.id); if (index < 0) map.markers.push(change.value); else map.markers[index] = change.value; break; }
          case 'marker.remove': map.markers = map.markers.filter(m => m.id !== change.id); break;
          case 'asset.add': {
            const entry = registry.find(a => a.asset.id === change.value.id);
            if (!entry) throw new HttpError(400, 'MISSING_ASSET');
            if (!map.assets.some(a => a.id === entry.asset.id)) map.assets.push(entry.asset);
            break;
          }
        }
      }
      const next = { map: mapSchema.parse(map), revision: stored.revision + 1 };
      await atomicJson(this.data(folder, 'draft.json'), next);
      return { ...next, published: !!await optionalJson(this.data(folder, 'published.json')) };
    });
  }
  async publish(id: string, revision: number): Promise<MapRecord> {
    return this.locked(async () => {
      const { folder, stored } = await this.find(id);
      if (revision !== stored.revision) throw new HttpError(409, 'REVISION_CONFLICT');
      const map = structuredClone(stored.map);
      map.markers = map.markers.filter(m => m.visible);
      const required = [map.title, ...map.layers.flatMap(l => [l.title, l.alt]), ...map.markers.map(m => m.title)];
      const optional = [map.description, ...map.markers.map(m => m.description)];
      for (const marker of map.markers) for (const media of marker.media) { required.push(media.title); if (media.kind === 'image') required.push(media.alt); }
      if (required.some(text => locales.some(l => !text[l].trim())) || optional.some(text => Object.values(text).some(Boolean) && locales.some(l => !text[l].trim()))) throw new HttpError(400, 'MISSING_TRANSLATIONS');
      const ids = usedAssets(map); map.assets = map.assets.filter(a => ids.has(a.id));
      for (const asset of map.assets) await this.safeFile(asset.path);
      await atomicJson(this.data(folder, 'published.json'), { map, revision: stored.revision });
      console.log(JSON.stringify({ event: 'map.published', mapId: id, revision }));
      return { ...stored, published: true };
    });
  }
  async unpublish(id: string, revision: number): Promise<MapRecord> {
    return this.locked(async () => {
      const { folder, stored } = await this.find(id);
      if (revision !== stored.revision) throw new HttpError(409, 'REVISION_CONFLICT');
      await atomicJson(this.data(folder, 'published.json'), null);
      console.log(JSON.stringify({ event: 'map.unpublished', mapId: id }));
      return { ...stored, published: false };
    });
  }
  async deleteMap(id: string): Promise<void> {
    return this.locked(async () => {
      const { folder } = await this.find(id);
      await rm(path.join(this.config.dataDir, folder), { recursive: true, force: true }).catch(() => undefined);
      await rm(path.join(this.config.mediaDir, folder), { recursive: true, force: true }).catch(() => undefined);
      console.log(JSON.stringify({ event: 'map.deleted', mapId: id }));
    });
  }
  private async safeFile(relative: string) {
    const root = await realpath(this.config.mediaDir);
    const file = await realpath(path.resolve(root, relative)).catch(() => { throw new HttpError(404, 'MISSING_ASSET'); });
    const inside = path.relative(root, file);
    if (inside.startsWith('..') || path.isAbsolute(inside) || !(await stat(file)).isFile()) throw new HttpError(404, 'MISSING_ASSET');
    return file;
  }
  async asset(id: string, assetId: string, editor: boolean, thumbnail: boolean) {
    const { folder } = await this.find(id);
    if (!editor) {
      const published = await optionalJson(this.data(folder, 'published.json'));
      if (!published || !storedSchema.parse(published).map.assets.some(a => a.id === assetId)) throw new HttpError(404, 'MISSING_ASSET');
    }
    const entry = (await this.registry(folder)).find(a => a.asset.id === assetId);
    if (!entry) throw new HttpError(404, 'MISSING_ASSET');
    return { file: await this.safeFile(thumbnail ? entry.thumbnail : entry.asset.path), mime: thumbnail ? 'image/webp' : entry.mime };
  }
}
