import { z } from 'zod';
import { assetSchema, layerSchema, localizedSchema, mapSchema, markerCategorySchema, markerSchema, type MapDocument } from './model';

export const mapRecordSchema = z.object({ map: mapSchema, revision: z.number().int().nonnegative(), published: z.boolean() });
export type MapRecord = z.infer<typeof mapRecordSchema>;
export const sessionSchema = z.object({ user: z.object({ username: z.string(), role: z.literal('editor') }).nullable() });
export type Session = z.infer<typeof sessionSchema>;
export const changeSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('metadata'), title: localizedSchema, description: localizedSchema }),
  z.object({ type: z.literal('layer.upsert'), value: layerSchema }),
  z.object({ type: z.literal('layer.remove'), id: z.string() }),
  z.object({ type: z.literal('category.upsert'), value: markerCategorySchema }),
  z.object({ type: z.literal('category.remove'), id: z.string() }),
  z.object({ type: z.literal('marker.upsert'), value: markerSchema }),
  z.object({ type: z.literal('marker.remove'), id: z.string() }),
  z.object({ type: z.literal('asset.add'), value: assetSchema }),
]);
export const changesSchema = z.object({ revision: z.number().int().nonnegative(), changes: z.array(changeSchema).max(3000) });
export type Change = z.infer<typeof changeSchema>;
export function changesBetween(before: MapDocument, after: MapDocument): Change[] {
  const changes: Change[] = [];
  const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
  if (!equal(before.title, after.title) || !equal(before.description, after.description)) changes.push({ type: 'metadata', title: after.title, description: after.description });
  for (const layer of after.layers) if (!equal(before.layers.find(l => l.id === layer.id), layer)) changes.push({ type: 'layer.upsert', value: layer });
  for (const layer of before.layers) if (!after.layers.some(l => l.id === layer.id)) changes.push({ type: 'layer.remove', id: layer.id });
  for (const category of after.markerCategories) if (!equal(before.markerCategories.find(c => c.id === category.id), category)) changes.push({ type: 'category.upsert', value: category });
  for (const category of before.markerCategories) if (!after.markerCategories.some(c => c.id === category.id)) changes.push({ type: 'category.remove', id: category.id });
  for (const marker of after.markers) if (!equal(before.markers.find(m => m.id === marker.id), marker)) changes.push({ type: 'marker.upsert', value: marker });
  for (const marker of before.markers) if (!after.markers.some(m => m.id === marker.id)) changes.push({ type: 'marker.remove', id: marker.id });
  for (const asset of after.assets) if (!before.assets.some(a => a.id === asset.id)) changes.push({ type: 'asset.add', value: asset });
  return changes;
}
