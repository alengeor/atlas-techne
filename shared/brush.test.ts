import { expect, it } from 'vitest';
import { layerSchema, localized } from './model';

it('preserves mixed brush styles through JSON validation and accepts legacy strokes', () => {
  const points = [{ x: 0.1, y: 0.2 }, { x: 0.8, y: 0.7 }];
  const stroke = { points, color: '#e6b65e', brushSize: 12 };
  const layer = {
    id: 'drawing', title: localized('Drawing'), alt: localized('Drawing'),
    type: 'brush', kind: 'overlay', color: stroke.color, brushSize: 12,
    visibleByDefault: true, order: 1, transform: { scale: 1, x: 0, y: 0, opacity: 1 },
    strokes: [points, stroke, { ...stroke, brushStyle: 'solid' }, { ...stroke, brushStyle: 'dotted' }, { ...stroke, brushStyle: 'dashed' }],
  };
  expect(layerSchema.parse(JSON.parse(JSON.stringify(layer))).strokes).toEqual(layer.strokes);
  expect(layerSchema.safeParse({ ...layer, strokes: [{ ...stroke, brushStyle: 'unknown' }] }).success).toBe(false);
});
