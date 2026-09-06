import { describe, expect, it } from 'vitest';
import { demoCatalog } from '../tests/fixtures/catalog';
import { initialLayers, mapSchema, orderedLayers, removeMapLayer, toggleLayer } from './model';

const fixture = () => { const map = demoCatalog()[0]; if (!map) throw new Error('Fixture missing'); return map; };
describe('versioned map contracts', () => {
  it('validates neutral fixture and rejects invalid positions, versions, paths and references', () => {
    const map = fixture();
    expect(mapSchema.safeParse(map).success).toBe(true);
    expect(mapSchema.safeParse({ ...map, schemaVersion: 99 }).success).toBe(false);
    const marker = map.markers[0]; if (!marker) throw new Error('Fixture missing');
    expect(mapSchema.safeParse({ ...map, markers: [{ ...marker, position: { x: -0.1, y: 0.5 } }] }).success).toBe(false);
    expect(mapSchema.safeParse({ ...map, assets: [] }).success).toBe(false);
    expect(mapSchema.safeParse({ ...map, assets: map.assets.map(a => ({ ...a, path: '../secret.png' })) }).success).toBe(false);
  });
  it('selects exactly one alternative and preserves active overlays', () => {
    const map = fixture(), overlay = map.layers.find(l => l.kind === 'overlay'), alternative = map.layers.find(l => l.kind === 'base' && !l.visibleByDefault);
    if (!overlay || !alternative) throw new Error('Fixture missing');
    const active = toggleLayer(map.layers, initialLayers(map), overlay);
    expect(toggleLayer(map.layers, active, alternative)).toEqual([overlay.id, alternative.id]);
    expect(active).toHaveLength(2);
    expect(toggleLayer(map.layers, active, overlay)).toEqual(initialLayers(map));
  });
  it('orders layers without mutating the document', () => {
    const layers = fixture().layers.reverse(); const first = layers[0];
    expect(orderedLayers(layers).map(l => l.order)).toEqual([0, 1, 2]);
    expect(layers[0]).toBe(first);
  });
  it('removes a layer and its marker references without leaving the map without a base', () => {
    const map = fixture();
    const overlay = map.layers.find(l => l.kind === 'overlay');
    const defaultBase = map.layers.find(l => l.kind === 'base' && l.visibleByDefault);
    if (!overlay || !defaultBase) throw new Error('Fixture missing');
    const withoutOverlay = removeMapLayer(map, overlay.id);
    expect(withoutOverlay.layers.some(l => l.id === overlay.id)).toBe(false);
    expect(withoutOverlay.markers.every(m => !m.layerIds.includes(overlay.id))).toBe(true);
    expect(mapSchema.safeParse(withoutOverlay).success).toBe(true);
    const singleBaseMap = { ...map, layers: [defaultBase] };
    expect(() => removeMapLayer(singleBaseMap, defaultBase.id)).toThrow(/base/i);
  });
  it('rejects duplicate IDs and multiple default base images', () => {
    const map = fixture();
    expect(mapSchema.safeParse({ ...map, layers: map.layers.map(l => ({ ...l, visibleByDefault: true })) }).success).toBe(false);
    expect(mapSchema.safeParse({ ...map, assets: [...map.assets, ...map.assets] }).success).toBe(false);
  });
  it('limits marker media to three items total', () => {
    const map = fixture();
    const marker = map.markers[0];
    const firstAsset = map.assets[0];
    if (!marker || !firstAsset) throw new Error('Fixture missing');
    const extraMedia = Array.from({ length: 4 }, (_, i) => ({
      id: `m${i}`,
      kind: 'image' as const,
      assetId: firstAsset.id,
      title: { es: `Media ${i}`, pt: `Media ${i}`, en: `Media ${i}` },
      alt: { es: `Alt ${i}`, pt: `Alt ${i}`, en: `Alt ${i}` },
    }));
    expect(mapSchema.safeParse({ ...map, markers: [{ ...marker, media: extraMedia }] }).success).toBe(false);
  });
});
