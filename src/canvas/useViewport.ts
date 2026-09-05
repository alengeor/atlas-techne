import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { boundView, contain, DEFAULT_VIEW, screenToImage, zoomAt, type Point, type Size, type View } from './geometry';

export function useViewport(image: Size, onPlace?: (point: Point) => void) {
  const viewport = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const view = useRef<View>({ ...DEFAULT_VIEW });
  const [size, setSize] = useState<Size>({ width: 1, height: 1 });
  const [zoom, setZoom] = useState(1);
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

  const reset = useCallback(() => { view.current = { ...DEFAULT_VIEW }; setZoom(1); paint(); }, [paint]);
  const zoomBy = useCallback((factor: number) => {
    const s = sizeRef.current;
    view.current = zoomAt(view.current, view.current.zoom * factor, { x: s.width / 2, y: s.height / 2 }, rectRef.current, s);
    setZoom(view.current.zoom); paint();
  }, [paint]);

  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const pointers = new Map<number, Point>();
    let start: Point | null = null, last: Point | null = null, moved = false, multi = false;
    let previousDistance = 0;
    const relative = (e: { clientX: number; clientY: number }): Point => {
      const bounds = element.getBoundingClientRect();
      return { x: e.clientX - bounds.left, y: e.clientY - bounds.top };
    };
    const pair = () => {
      const [a, b] = [...pointers.values()];
      return a && b ? { center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, distance: Math.hypot(a.x - b.x, a.y - b.y) } : null;
    };
    const down = (e: PointerEvent) => {
      if (e.button !== 0 || (e.target instanceof Element && e.target.closest('button'))) return;
      element.focus({ preventScroll: true });
      element.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, relative(e));
      if (pointers.size === 1) { start = relative(e); last = start; moved = false; multi = false; }
      else { multi = true; moved = true; const p = pair(); previousDistance = p?.distance ?? 0; last = p?.center ?? null; }
    };
    const move = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      const point = relative(e);
      pointers.set(e.pointerId, point);
      if (start && Math.hypot(point.x - start.x, point.y - start.y) > 6) moved = true;
      const p = pair();
      if (p && previousDistance > 0) {
        view.current = zoomAt(view.current, view.current.zoom * p.distance / previousDistance, last ?? p.center, rectRef.current, sizeRef.current);
        if (last) view.current = boundView({ ...view.current, x: view.current.x + p.center.x - last.x, y: view.current.y + p.center.y - last.y }, rectRef.current, sizeRef.current);
        previousDistance = p.distance; last = p.center;
      } else if (last && moved) {
        view.current = boundView({ ...view.current, x: view.current.x + point.x - last.x, y: view.current.y + point.y - last.y }, rectRef.current, sizeRef.current);
        last = point;
      }
      paint();
    };
    const up = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      if (e.type === 'pointerup' && !moved && !multi) {
        const point = screenToImage(relative(e), rectRef.current, view.current);
        if (point) onPlaceRef.current?.(point);
      }
      pointers.delete(e.pointerId);
      if (element.hasPointerCapture(e.pointerId)) element.releasePointerCapture(e.pointerId);
      last = [...pointers.values()][0] ?? null;
      previousDistance = 0;
      setZoom(view.current.zoom);
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      view.current = zoomAt(view.current, view.current.zoom * Math.exp(-Math.max(-200, Math.min(200, e.deltaY)) * 0.002), relative(e), rectRef.current, sizeRef.current);
      setZoom(view.current.zoom); paint();
    };
    const key = (e: KeyboardEvent) => {
      if (e.target !== element) return;
      const amount = e.shiftKey ? 100 : 35;
      const delta: Record<string, Point> = { ArrowLeft: { x: amount, y: 0 }, ArrowRight: { x: -amount, y: 0 }, ArrowUp: { x: 0, y: amount }, ArrowDown: { x: 0, y: -amount } };
      const step = delta[e.key];
      if (step) { e.preventDefault(); view.current = boundView({ ...view.current, x: view.current.x + step.x, y: view.current.y + step.y }, rectRef.current, sizeRef.current); paint(); }
      if (['+', '=', '-', '0'].includes(e.key)) { e.preventDefault(); if (e.key === '0') reset(); else zoomBy(e.key === '-' ? 0.8 : 1.25); }
    };
    element.addEventListener('pointerdown', down);
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerup', up);
    element.addEventListener('pointercancel', up);
    element.addEventListener('wheel', wheel, { passive: false });
    element.addEventListener('keydown', key);
    return () => {
      element.removeEventListener('pointerdown', down); element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerup', up); element.removeEventListener('pointercancel', up);
      element.removeEventListener('wheel', wheel); element.removeEventListener('keydown', key);
    };
  }, [paint, reset, zoomBy]);
  return { viewport, world, rect, zoom, zoomBy, reset };
}
