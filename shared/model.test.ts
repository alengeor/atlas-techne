import { describe, expect, it } from 'vitest';
import { demoCatalog } from '../tests/fixtures/catalog';
import { initialLayers, mapSchema, orderedLayers, parseVideoUrl, toggleLayer } from './model';

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
  it('rejects duplicate IDs and multiple default base images', () => {
    const map = fixture();
    expect(mapSchema.safeParse({ ...map, layers: map.layers.map(l => ({ ...l, visibleByDefault: true })) }).success).toBe(false);
    expect(mapSchema.safeParse({ ...map, assets: [...map.assets, ...map.assets] }).success).toBe(false);
  });
});
describe('external videos', () => {
  it('parses allowlisted HTTPS videos', () => {
    expect(parseVideoUrl('https://www.youtube.com/watch?v=AbCdEf12345')).toBe('AbCdEf12345');
    expect(parseVideoUrl('https://youtu.be/AbCdEf12345')).toBe('AbCdEf12345');
  });
  it.each(['javascript:alert(1)', 'http://youtu.be/AbCdEf12345', 'https://youtube.com.evil.test/watch?v=AbCdEf12345', 'https://user@youtu.be/AbCdEf12345', 'https://youtu.be/invalid'])('rejects %s', url => expect(parseVideoUrl(url)).toBeNull());
});
