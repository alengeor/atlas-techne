import type { Appearance } from '../../../shared/model';
import type { Point } from '../../canvas/geometry';
export type Tool = { mode: 'select' } | { mode: 'placing'; appearance: Appearance } | { mode: 'inspecting'; position: Point; appearance: Appearance };
export type ToolEvent = { type: 'arm'; appearance: Appearance } | { type: 'place'; position: Point | null; dragged: boolean } | { type: 'cancel' | 'applied' };
export function toolReducer(state: Tool, event: ToolEvent): Tool {
  switch (event.type) {
    case 'arm': return { mode: 'placing', appearance: event.appearance };
    case 'place': return state.mode === 'placing' && event.position && !event.dragged ? { mode: 'inspecting', appearance: state.appearance, position: event.position } : state;
    case 'cancel': case 'applied': return { mode: 'select' };
  }
}
