import sharp from 'sharp';
import { HttpError } from './errors.js';

export async function validateImage(bytes: Buffer, filename: string, mime: string, icon = false) {
  if (!/\.(png|jpe?g|webp)$/i.test(filename) || bytes.length > (icon ? 2 : 25) * 1024 * 1024) throw new HttpError(400, 'INVALID_IMAGE');
  try {
    const image = sharp(bytes, { limitInputPixels: 40_000_000, failOn: 'warning' });
    const meta = await image.metadata();
    const allowed = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' };
    const format = meta.format;
    if (!format || !(format in allowed) || !meta.width || !meta.height || (meta.pages ?? 1) > 1) throw new Error('format');
    const extension = format === 'jpeg' ? 'jpg' : format;
    const expected = format === 'png' ? allowed.png : format === 'jpeg' ? allowed.jpeg : allowed.webp;
    const extensionMatches = format === 'jpeg' ? /\.jpe?g$/i.test(filename) : filename.toLowerCase().endsWith(`.${extension}`);
    if (!extensionMatches) throw new Error('extension');
    if (mime !== expected || meta.width > 20000 || meta.height > 20000 || (icon && (meta.width > 1024 || meta.height > 1024))) throw new Error('limits');
    const original = await image.rotate().toBuffer();
    const normalized = await sharp(original).metadata();
    const thumbnail = await sharp(original).resize({ width: 320, height: 220, fit: 'inside', withoutEnlargement: true }).webp().toBuffer();
    return { bytes: original, thumbnail, extension, width: normalized.width ?? meta.width, height: normalized.height ?? meta.height, mime: expected };
  } catch { throw new HttpError(400, 'INVALID_IMAGE'); }
}

export async function validateMedia(bytes: Buffer, filename: string, mime: string, icon = false) {
  if (/\.(png|jpe?g|webp)$/i.test(filename)) return validateImage(bytes, filename, mime, icon);
  const allowedVideo = new Set(['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v', 'application/octet-stream']);
  const allowedExt = /\.(mp4|webm|mov|m4v)$/i;
  if (!allowedExt.test(filename) || (!allowedVideo.has(mime) && !allowedExt.test(filename)) || bytes.length > 100 * 1024 * 1024) throw new HttpError(400, 'INVALID_VIDEO');
  const extension = filename.toLowerCase().match(/\.(mp4|webm|mov|m4v)$/i)?.[1] ?? 'mp4';
  return { bytes, thumbnail: Buffer.alloc(0), extension, width: 0, height: 0, mime: mime || 'video/mp4' };
}
