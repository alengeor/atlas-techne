import { expect, it } from 'vitest';
import { toolReducer, type Tool } from './tool';

it('requires an armed tool and valid non-drag placement; cancel discards provisional state', () => {
  const idle: Tool = { mode: 'select' };
  const place = { type: 'place', position: { x: 0.5, y: 0.5 }, dragged: false } as const;
  expect(toolReducer(idle, place)).toBe(idle);
  const armed = toolReducer(idle, { type: 'arm', appearance: { kind: 'system', icon: 'pin', color: '#e6b65e' } });
  expect(toolReducer(armed, { ...place, position: null })).toBe(armed);
  expect(toolReducer(armed, { ...place, dragged: true })).toBe(armed);
  const provisional = toolReducer(armed, place);
  expect(provisional.mode).toBe('inspecting');
  expect(toolReducer(provisional, { type: 'cancel' })).toEqual(idle);
  expect(toolReducer(provisional, { type: 'applied' })).toEqual(idle);
});
