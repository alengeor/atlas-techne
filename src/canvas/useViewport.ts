import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { boundView, contain, DEFAULT_VIEW, screenToImage, type Point, type Size, type View } from './geometry';

export function useViewport(image: Size, onPlace?: (point: Point) => void) {
  const viewport = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const view = useRef<View>({ ...DEFAULT_VIEW });
  const [size, setSize] = useState<Size>({ width: 1, height: 1 });
  const rect = useMemo(() => contain(size, { width: image.width, height: image.height }), [size, image.width, image.height]);
  const rectRef = useRef(rect); rectRef.current = rect;
  const sizeRef = useRef(size); sizeRef.current = size;
  const onPlaceRef = useRef(onPlace); onPlaceRef.current = onPlace;
  const frame = useRef(0);
  const paint = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const node = world.current;
      if (!node) return;
      const v = view.current;
      node.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.zoom})`;
      node.style.setProperty('--inverse-zoom', String(1 / v.zoom));
      node.dataset.zoom = String(v.zoom);
    });
  }, []);
  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(entries => {
      const box = entries[0]?.contentRect;
      if (box) setSize({ width: box.width, height: box.height });
    });
    observer.observe(element);
    return () => { observer.disconnect(); cancelAnimationFrame(frame.current); };
  }, []);
  useLayoutEffect(() => {
    view.current = boundView(view.current, rect, size);
    paint();
  }, [size, rect, paint]);

  const reset = useCallback(() => { view.current = { ...DEFAULT_VIEW }; paint(); }, [paint]);

  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const pointers = new Map<number, Point>();
    let start: Point | null = null, moved = false;
    const relative = (e: { clientX: number; clientY: number }): Point => {
      const bounds = element.getBoundingClientRect();
      return { x: e.clientX - bounds.left, y: e.clientY - bounds.top };
    };
    const down = (e: PointerEvent) => {
      if (e.button !== 0 || (e.target instanceof Element && e.target.closest('button'))) return;
      element.focus({ preventScroll: true });
      element.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, relative(e));
      start = relative(e); moved = false;
    };
    const move = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      const point = relative(e);
      pointers.set(e.pointerId, point);
      if (start && Math.hypot(point.x - start.x, point.y - start.y) > 6) moved = true;
    };
    const up = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      if (e.type === 'pointerup' && !moved) {
        const point = screenToImage(relative(e), rectRef.current, view.current);
        if (point) onPlaceRef.current?.(point);
      }
      pointers.delete(e.pointerId);
      if (element.hasPointerCapture(e.pointerId)) element.releasePointerCapture(e.pointerId);
    };
    const key = (e: KeyboardEvent) => {
      if (e.target !== element) return;
      if (e.key === '0') { e.preventDefault(); reset(); }
    };
    element.addEventListener('pointerdown', down);
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerup', up);
    element.addEventListener('pointercancel', up);
    element.addEventListener('keydown', key);
    return () => {
      element.removeEventListener('pointerdown', down); element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerup', up); element.removeEventListener('pointercancel', up);
      element.removeEventListener('keydown', key);
    };
  }, [paint, reset]);
  const getImagePoint = useCallback((clientX: number, clientY: number) => {
    const element = viewport.current;
    if (!element) return null;
    const bounds = element.getBoundingClientRect();
    return screenToImage({ x: clientX - bounds.left, y: clientY - bounds.top }, rectRef.current, view.current);
  }, []);
  return { viewport, world, rect, reset, getImagePoint };
}
