export type LocalImage = { id: string; url: string; width: number; height: number; extension: string; name: string; file: File };
export async function readImage(file: File): Promise<LocalImage> {
  if (file.size > 25 * 1024 * 1024 || file.size === 0) throw new Error('invalidImage');
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b);
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp = String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  const extension = png ? 'png' : jpeg ? 'jpg' : webp ? 'webp' : null;
  const expectedMime = png ? 'image/png' : jpeg ? 'image/jpeg' : 'image/webp';
  if (!extension || file.type !== expectedMime || !/\.(png|jpe?g|webp)$/i.test(file.name)) throw new Error('invalidImage');
  const bitmap = await createImageBitmap(file).catch(() => { throw new Error('invalidImage'); });
  const { width, height } = bitmap;
  bitmap.close();
  if (width * height > 40_000_000 || width > 20000 || height > 20000) throw new Error('invalidImage');
  return { id: crypto.randomUUID(), url: URL.createObjectURL(file), width, height, extension, name: file.name, file };
}
