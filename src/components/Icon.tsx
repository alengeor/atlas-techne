import type { CSSProperties } from 'react';
const paths = {
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z',
  star: 'm12 2 3 6.5 7 1-5 5 1.2 7-6.2-3.3L5.8 22 7 14.5l-5-5 7-1Z',
  camera: 'M3 6h5l2-3h4l2 3h5v15H3ZM16 13a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z',
  anchor: 'M12 8v14M5 12H2a10 10 0 0 0 20 0h-3M8 12h8M15 5a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z',
  info: 'M12 11v6M12 7v.1M22 12a10 10 0 1 0-20 0 10 10 0 0 0 20 0Z',
  warning: 'm12 2 10 19H2ZM12 9v5M12 17v.1',
  layers: 'm12 2 10 5-10 5L2 7Zm-10 10 10 5 10-5M2 17l10 5 10-5',
  plus: 'M12 4v16M4 12h16', minus: 'M4 12h16', close: 'm5 5 14 14M19 5 5 19',
  back: 'm10 5-7 7 7 7M3 12h18', upload: 'M12 16V2m-5 5 5-5 5 5M3 14v8h18v-8',
  fit: 'M3 9V3h6M15 3h6v6M21 15v6h-6M9 21H3v-6',
  reset: 'M3 4v6h6M3 10a9 9 0 1 1 2 9', edit: 'm3 17 14-14 4 4L7 21H3ZM14 6l4 4',
  chevron: 'm8 4 8 8-8 8', up: 'm5 15 7-7 7 7', down: 'm5 9 7 7 7-7',
  trash: 'M3 5h18M9 5V2h6v3M5 5l1 17h12l1-17M10 9v9M14 9v9',
} satisfies Record<string, string>;
export type IconName = keyof typeof paths;
export function Icon({ name, style }: { name: IconName; style?: CSSProperties }) {
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}><path d={paths[name]} /></svg>;
}
