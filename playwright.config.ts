import { defineConfig } from '@playwright/test';
import { mkdtempSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const directory = process.env.ATLAS_E2E_DIR ?? mkdtempSync(path.join(tmpdir(), 'atlas-austral-e2e-'));
process.env.ATLAS_E2E_DIR = directory;
mkdirSync(path.join(directory, 'private'), { recursive: true });

export default defineConfig({
  testDir: './tests/e2e', workers: 1, retries: 0, timeout: 120000,
  use: { baseURL: 'http://localhost:5175', locale: 'es-AR', viewport: { width: 1440, height: 960 }, screenshot: 'only-on-failure' },
  webServer: {
    command: 'npm run dev', url: 'http://localhost:5175', reuseExistingServer: false,
    env: { WEB_PORT: '5175', API_PORT: '5176', APP_ORIGINS: 'http://localhost:5175', MAPS_DATA_DIR: path.join(directory, 'maps-data'), MAPS_MULTIMEDIA_DIR: path.join(directory, 'maps-multimedia'), PRIVATE_CONFIG_DIR: path.join(directory, 'private') },
  },
});
