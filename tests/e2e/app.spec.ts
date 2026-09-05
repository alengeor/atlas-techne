import { expect, test, type Page } from '@playwright/test';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { mapSchema } from '../../shared/model';

async function image(page: Page, width: number, height: number) {
  const data = await page.evaluate(({ width, height }) => {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('No canvas');
    ctx.fillStyle = '#8ab0bd'; ctx.fillRect(0, 0, width, height); return canvas.toDataURL('image/png').split(',')[1] ?? '';
  }, { width, height });
  return { name: 'image.png', mimeType: 'image/png', buffer: Buffer.from(data, 'base64') };
}
async function titles(page: Page, text: string) {
  const dialog = page.getByRole('dialog'); await dialog.getByLabel('Título · ES').fill(text);
  await dialog.getByRole('button', { name: /PT/ }).click(); await dialog.getByLabel('Título · PT').fill(text);
  await dialog.getByRole('button', { name: /EN/ }).click(); await dialog.getByLabel('Título · EN').fill(text);
}
test('editor creates a real map, saves mixed-aspect layers, and controls public access', async ({ page, browser }) => {
  await page.goto('/'); await expect(page.getByText('Todavía no hay mapas publicados.')).toBeVisible();
  await expect(page.getByRole('button', { name: /Agregar mapa/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Área de edición' }).click();
  await page.getByLabel('Usuario', { exact: true }).fill('test-editor');
  await page.getByLabel('Contraseña', { exact: true }).fill(process.env.ATLAS_E2E_PASSWORD ?? '');
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await page.getByRole('button', { name: /Agregar mapa/ }).click(); await titles(page, 'Mi mapa');
  await page.getByRole('dialog').locator('input[type=file]').setInputFiles(await image(page, 800, 400));
  await page.getByRole('button', { name: 'Crear mapa', exact: true }).click();
  await page.getByRole('button', { name: 'Agregar capa', exact: true }).click(); await titles(page, 'Capa vertical');
  await page.getByRole('dialog').locator('input[type=file]').setInputFiles(await image(page, 120, 300));
  await page.getByRole('dialog').getByRole('button', { name: 'Agregar capa', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Capa vertical' })).toBeChecked();
  const overlay = page.locator('.canvas-world > .layer-image').nth(1);
  const bounds = await overlay.boundingBox(); if (!bounds) throw new Error('Overlay missing');
  expect(bounds.width / bounds.height).toBeCloseTo(0.4, 2);
  await page.getByRole('button', { name: 'Guardar cambios', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Guardar cambios', exact: true })).toBeDisabled();
  const mapId = page.url().split('/').at(-1) ?? '';
  await page.reload(); await page.getByRole('button', { name: 'Superposiciones', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Capa vertical' })).toBeVisible();
  const directory = process.env.ATLAS_E2E_DIR ?? '';
  const folders = await readdir(path.join(directory, 'maps-data')); expect(folders).toEqual(['mi-mapa']);
  const data = z.object({ map: mapSchema }).parse(JSON.parse(await readFile(path.join(directory, 'maps-data/mi-mapa/draft.json'), 'utf8')));
  expect(data.map.layers).toHaveLength(2);
  for (const asset of data.map.assets) expect((await stat(path.join(directory, 'maps-multimedia', asset.path))).isFile()).toBe(true);
  const guest = await browser.newContext();
  expect(await (await guest.request.get('http://localhost:5175/api/maps')).json()).toEqual([]);
  const denied = await guest.request.post(`http://localhost:5175/api/maps/${mapId}/changes`, { headers: { Origin: 'http://localhost:5175', 'X-Atlas-Request': '1' }, data: { revision: 1, changes: [] } });
  expect(denied.status()).toBe(401);
  const privateAsset = await guest.request.get(`http://localhost:5175/api/maps/${mapId}/assets/${data.map.assets[0]?.id}`); expect(privateAsset.status()).toBe(404);
  await page.getByRole('button', { name: 'Publicar', exact: true }).click();
  await expect(page.getByText('Publicado', { exact: true })).toBeVisible();
  expect((await (await guest.request.get('http://localhost:5175/api/maps')).json()).length).toBe(1);
  await guest.close();
});
