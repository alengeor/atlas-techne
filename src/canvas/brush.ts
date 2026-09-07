import type { BrushStyle } from '../../shared/model';

export function brushDashArray(style: BrushStyle | undefined, width: number) {
  if (style === 'dotted') return `0 ${width * 2.5}`;
  if (style === 'dashed') return `${width * 4} ${width * 2.5}`;
  return undefined;
}
