import { describe, expect, it } from 'vitest';
import { boundView, contain, DEFAULT_VIEW, imageToScreen, screenToImage, zoomAt } from './geometry';

describe('shared image space', () => {
  it('calculates horizontal and vertical letterboxing', () => {
    expect(contain({ width: 1200, height: 800 }, { width: 400, height: 800 })).toEqual({ x: 400, y: 0, width: 400, height: 800 });
    expect(contain({ width: 800, height: 800 }, { width: 1600, height: 800 })).toEqual({ x: 0, y: 200, width: 800, height: 400 });
  });
  it('rejects clicks outside the actual image instead of clamping them to an edge', () => {
    const rect = contain({ width: 1200, height: 800 }, { width: 400, height: 800 });
    expect(screenToImage({ x: 399, y: 300 }, rect, DEFAULT_VIEW)).toBeNull();
    expect(screenToImage({ x: 400, y: 0 }, rect, DEFAULT_VIEW)).toEqual({ x: 0, y: 0 });
    expect(screenToImage({ x: 800, y: 800 }, rect, DEFAULT_VIEW)).toEqual({ x: 1, y: 1 });
  });
  it.each([{ width: 1920, height: 1082 }, { width: 1918, height: 1082 }, { width: 768, height: 1024 }])('round-trips positions after zoom and pan at $width × $height', size => {
    const rect = contain(size, { width: 1440, height: 960 });
    const view = { zoom: 2.5, x: -290, y: -150 };
    const original = { x: 0.38, y: 0.77 };
    const result = screenToImage(imageToScreen(original, rect, view), rect, view);
    expect(result?.x).toBeCloseTo(original.x, 10); expect(result?.y).toBeCloseTo(original.y, 10);
  });
  it('zooms around the interaction point and bounds pan', () => {
    const size = { width: 1000, height: 1000 }, rect = contain(size, size), anchor = { x: 300, y: 400 };
    const view = zoomAt(DEFAULT_VIEW, 2, anchor, rect, size);
    expect(screenToImage(anchor, rect, view)).toEqual({ x: 0.3, y: 0.4 });
    expect(boundView({ zoom: 2, x: -99999, y: 99999 }, rect, size)).toEqual({ zoom: 2, x: -1000, y: -0 });
  });
});
