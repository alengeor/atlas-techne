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
    const original = await image.rotate().toBuffer(); // Decode completely; canonical orientation for portable dimensions.
    const normalized = await sharp(original).metadata();
    const thumbnail = await sharp(original).resize({ width: 320, height: 220, fit: 'inside', withoutEnlargement: true }).webp().toBuffer();
    return { bytes: original, thumbnail, extension, width: normalized.width ?? meta.width, height: normalized.height ?? meta.height, mime: expected };
  } catch { throw new HttpError(400, 'INVALID_IMAGE'); }
}
