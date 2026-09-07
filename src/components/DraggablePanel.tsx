import { useLayoutEffect, useRef, type ReactNode } from 'react';

export function DraggablePanel({ title, moveLabel, children }: { title: string; moveLabel: string; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointerId: number; x: number; y: number } | null>(null);

  const move = (x: number, y: number) => {
    const element = panel.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    element.style.left = `${Math.max(8, Math.min(x, window.innerWidth - bounds.width - 8))}px`;
    element.style.top = `${Math.max(8, Math.min(y, window.innerHeight - bounds.height - 8))}px`;
    element.style.transform = 'none';
  };

  useLayoutEffect(() => {
    const element = panel.current;
    if (!element) return;
    const keepVisible = () => {
      const bounds = element.getBoundingClientRect();
      move(bounds.left, bounds.top);
    };
    keepVisible();
    const observer = new ResizeObserver(keepVisible);
    observer.observe(element);
    window.addEventListener('resize', keepVisible);
    return () => { observer.disconnect(); window.removeEventListener('resize', keepVisible); };
  }, []);

  return <div ref={panel} className="drawing-window surface" role="region" aria-label={title}>
    <button type="button" className="drawing-window-handle" aria-label={moveLabel} title={moveLabel}
      onPointerDown={event => {
        if (event.button !== 0 || drag.current) return;
        const bounds = panel.current!.getBoundingClientRect();
        drag.current = { pointerId: event.pointerId, x: event.clientX - bounds.left, y: event.clientY - bounds.top };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => {
        const current = drag.current;
        if (current?.pointerId === event.pointerId) move(event.clientX - current.x, event.clientY - current.y);
      }}
      onPointerUp={event => {
        if (drag.current?.pointerId !== event.pointerId) return;
        drag.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => { drag.current = null; }}
      onLostPointerCapture={() => { drag.current = null; }}
      onKeyDown={event => {
        const step = event.shiftKey ? 40 : 10;
        const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
        if (!delta || !panel.current) return;
        event.preventDefault();
        const bounds = panel.current.getBoundingClientRect();
        move(bounds.left + delta[0]!, bounds.top + delta[1]!);
      }}>
      <span>{title}</span><span className="drawing-window-grip" aria-hidden="true">⠿</span>
    </button>
    <div className="placement-banner drawing-banner">{children}</div>
  </div>;
}
