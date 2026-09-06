import { z } from 'zod';

export const locales = ['es', 'pt', 'en'] as const;
export type Locale = typeof locales[number];
export const localizedSchema = z.object({ es: z.string().max(8000), pt: z.string().max(8000), en: z.string().max(8000) });
export type LocalizedText = z.infer<typeof localizedSchema>;
const id = z.string().min(1).max(100);
const unit = z.number().finite().min(0).max(1);
export const systemIcons = ['pin', 'star', 'camera', 'anchor', 'info', 'warning'] as const;
export const appearanceSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('system'), icon: z.enum(systemIcons), color: z.string().regex(/^#[0-9a-fA-F]{6}$/) }),
  z.object({ kind: z.literal('custom'), assetId: id }),
]);
export const mediaSchema = z.discriminatedUnion('kind', [
  z.object({ id, kind: z.literal('image'), assetId: id, title: localizedSchema.optional(), alt: localizedSchema.optional() }),
  z.object({ id, kind: z.literal('video'), assetId: id, title: localizedSchema.optional() }),
]);
export const markerCategorySchema = z.object({
  id, title: localizedSchema, color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#e6b65e'), visibleByDefault: z.boolean(),
});
export type MarkerCategory = z.infer<typeof markerCategorySchema>;
export const markerSchema = z.object({
  id, position: z.object({ x: unit, y: unit }), title: localizedSchema, description: localizedSchema,
  appearance: appearanceSchema, visible: z.boolean(), layerIds: z.array(id), categoryId: id.optional(), media: z.array(mediaSchema).max(3),
  labelPosition: z.enum(['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west']).default('south'),
  labelDistance: z.number().finite().min(0).max(200).default(3),
});
export type Marker = z.infer<typeof markerSchema>;
export type Appearance = z.infer<typeof appearanceSchema>;
export const layerSchema = z.object({
  id, title: localizedSchema, alt: localizedSchema, assetId: id,
  kind: z.enum(['base', 'overlay']), visibleByDefault: z.boolean(), order: z.number().int(),
  transform: z.object({ scale: z.number().finite().min(0.05).max(10), x: z.number().finite().min(-2).max(2), y: z.number().finite().min(-2).max(2), opacity: unit }),
});
export type MapLayer = z.infer<typeof layerSchema>;
export const assetSchema = z.object({
  id, path: z.string().min(1).refine(p => !p.startsWith('/') && !p.includes('\\') && !p.includes(':') && !p.split('/').some(s => !s || s === '.' || s === '..')),
  width: z.number().int().positive().max(20000), height: z.number().int().positive().max(20000),
});
export type MapAsset = z.infer<typeof assetSchema>;
export const mapSchema = z.object({
  schemaVersion: z.literal(1), id, title: localizedSchema, description: localizedSchema,
  width: z.number().positive().max(20000), height: z.number().positive().max(20000),
  layers: z.array(layerSchema).min(1).max(30), markerCategories: z.array(markerCategorySchema).max(50).default([]),
  markers: z.array(markerSchema).max(500), assets: z.array(assetSchema).max(2000),
}).superRefine((map, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: 'custom', message });
  const assetIds = new Set(map.assets.map(a => a.id));
  const layerIds = new Set(map.layers.map(l => l.id));
  const categoryIds = new Set(map.markerCategories.map(category => category.id));
  if (assetIds.size !== map.assets.length || layerIds.size !== map.layers.length || categoryIds.size !== map.markerCategories.length || new Set(map.markers.map(m => m.id)).size !== map.markers.length) fail('Duplicate IDs');
  if (!map.layers.some(l => l.kind === 'base')) fail('A reference layer is required');
  if (map.layers.filter(l => l.kind === 'base' && l.visibleByDefault).length !== 1) fail('Exactly one initial base layer is required');
  for (const layer of map.layers) if (!assetIds.has(layer.assetId)) fail('Missing layer asset');
  for (const marker of map.markers) {
    if (marker.layerIds.some(l => !layerIds.has(l))) fail('Missing marker layer');
    if (marker.categoryId && !categoryIds.has(marker.categoryId)) fail('Missing marker category');
    if (marker.appearance.kind === 'custom' && !assetIds.has(marker.appearance.assetId)) fail('Missing icon');
    for (const media of marker.media) if (!assetIds.has(media.assetId)) fail('Missing media asset');
  }
});
export type MapDocument = z.infer<typeof mapSchema>;
export const localized = (es = '', pt = es, en = es): LocalizedText => ({ es, pt, en });
export function initialLayers(map: MapDocument): string[] { return map.layers.filter(l => l.visibleByDefault).map(l => l.id); }
export function toggleLayer(layers: MapLayer[], active: string[], target: MapLayer): string[] {
  if (target.kind === 'base') return [...active.filter(id => layers.find(l => l.id === id)?.kind !== 'base'), target.id];
  return active.includes(target.id) ? active.filter(id => id !== target.id) : [...active, target.id];
}
export function removeMapLayer(map: MapDocument, layerId: string): MapDocument {
  const layer = map.layers.find(l => l.id === layerId);
  if (!layer) return map;
  const remainingBases = map.layers.filter(l => l.kind === 'base' && l.id !== layerId);
  if (layer.kind === 'base' && remainingBases.length === 0) {
    throw new Error('No puedes eliminar la última capa base');
  }
  const layers = map.layers.filter(l => l.id !== layerId).map(l => ({ ...l, visibleByDefault: layer.kind === 'base' && l.kind === 'base' && layer.visibleByDefault && l.id === remainingBases[0]?.id ? true : l.visibleByDefault }));
  if (layer.kind === 'base' && layer.visibleByDefault && remainingBases.length > 0) {
    const nextDefaultId = remainingBases[0]?.id;
    return {
      ...map,
      layers: layers.map(l => ({ ...l, visibleByDefault: l.id === nextDefaultId ? true : false })),
      markers: map.markers.map(marker => ({ ...marker, layerIds: marker.layerIds.filter(id => id !== layerId) })),
    };
  }
  return {
    ...map,
    layers,
    markers: map.markers.map(marker => ({ ...marker, layerIds: marker.layerIds.filter(id => id !== layerId) })),
  };
}
export function orderedLayers(layers: MapLayer[]): MapLayer[] { return [...layers].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id)); }
