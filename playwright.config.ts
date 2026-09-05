import { defineConfig } from '@playwright/test';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomBytes, scryptSync } from 'node:crypto';

const directory = process.env.ATLAS_E2E_DIR ?? mkdtempSync(path.join(tmpdir(), 'atlas-techne-e2e-'));
process.env.ATLAS_E2E_DIR = directory;
const password = process.env.ATLAS_E2E_PASSWORD ?? randomBytes(16).toString('hex');
process.env.ATLAS_E2E_PASSWORD = password;
mkdirSync(path.join(directory, 'private'), { recursive: true });
const salt = randomBytes(16).toString('hex');
writeFileSync(path.join(directory, 'private/admin.json'), JSON.stringify({ username: 'test-editor', salt, hash: scryptSync(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 128 * 1024 * 1024 }).toString('hex') }));

export default defineConfig({
  testDir: './tests/e2e', workers: 1, retries: 0, timeout: 60000,
  use: { baseURL: 'http://localhost:5175', locale: 'es-AR', viewport: { width: 1440, height: 960 }, screenshot: 'only-on-failure' },
  webServer: {
    command: 'npm run dev', url: 'http://localhost:5175', reuseExistingServer: false,
    env: { WEB_PORT: '5175', API_PORT: '5176', APP_ORIGINS: 'http://localhost:5175', MAPS_DATA_DIR: path.join(directory, 'maps-data'), MAPS_MULTIMEDIA_DIR: path.join(directory, 'maps-multimedia'), PRIVATE_CONFIG_DIR: path.join(directory, 'private') },
  },
});
