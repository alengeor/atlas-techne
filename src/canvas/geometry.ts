export type Point = { x: number; y: number };
export type Size = { width: number; height: number };
export type Rect = Point & Size;
export type View = { zoom: number; x: number; y: number };
export const DEFAULT_VIEW: View = { zoom: 1, x: 0, y: 0 };
export function contain(container: Size, image: Size): Rect {
  if (image.width <= 0 || image.height <= 0 || container.width <= 0 || container.height <= 0) return { x: 0, y: 0, width: 0, height: 0 };
  const scale = Math.min(container.width / image.width, container.height / image.height);
  const width = image.width * scale, height = image.height * scale;
  return { width, height, x: (container.width - width) / 2, y: (container.height - height) / 2 };
}
export function imageToScreen(point: Point, rect: Rect, view: View): Point {
  return { x: rect.x + view.x + point.x * rect.width * view.zoom, y: rect.y + view.y + point.y * rect.height * view.zoom };
}
export function screenToImage(point: Point, rect: Rect, view: View): Point | null {
  if (rect.width <= 0 || rect.height <= 0) return null;
  const x = (point.x - rect.x - view.x) / (rect.width * view.zoom);
  const y = (point.y - rect.y - view.y) / (rect.height * view.zoom);
  return x >= 0 && x <= 1 && y >= 0 && y <= 1 ? { x, y } : null;
}
export function boundView(view: View, rect: Rect, size: Size): View {
  const zoom = Math.min(8, Math.max(1, view.zoom));
  const width = rect.width * zoom, height = rect.height * zoom;
  const bound = (offset: number, length: number, available: number, origin: number) => length <= available
    ? (available - length) / 2 - origin
    : Math.max(available - length - origin, Math.min(-origin, offset));
  return { zoom, x: bound(view.x, width, size.width, rect.x), y: bound(view.y, height, size.height, rect.y) };
}
export function zoomAt(view: View, zoom: number, anchor: Point, rect: Rect, size: Size): View {
  const nextZoom = Math.min(8, Math.max(1, zoom));
  const ratio = nextZoom / view.zoom;
  return boundView({ zoom: nextZoom, x: anchor.x - rect.x - (anchor.x - rect.x - view.x) * ratio, y: anchor.y - rect.y - (anchor.y - rect.y - view.y) * ratio }, rect, size);
}
