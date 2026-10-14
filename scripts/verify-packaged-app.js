import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listPackage } from '@electron/asar';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packagedRoot = path.join(root, 'release', 'win-unpacked');
const executable = path.join(packagedRoot, 'Atlas Austral.exe');
const asar = path.join(packagedRoot, 'resources', 'app.asar');
const loader = path.join(asar, 'electron', 'backend-loader.cjs');
const scratch = await mkdtemp(path.join(tmpdir(), 'atlas-austral-package-'));
let child;

function ready(process) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => reject(new Error(`Timeout al iniciar el paquete. ${stderr}`)), 20_000);
    process.stdout.on('data', chunk => {
      stdout += chunk.toString('utf8');
      const lines = stdout.split(/\r?\n/);
      stdout = lines.pop() ?? '';
      for (const line of lines) {
        try {
          const message = JSON.parse(line);
          if (message.event === 'server.ready') {
            clearTimeout(timer);
            resolve(message.port);
          }
        } catch { /* Ignora salida ajena al protocolo JSON. */ }
      }
    });
    process.stderr.on('data', chunk => { stderr = `${stderr}${chunk.toString('utf8')}`.slice(-4000); });
    process.once('exit', code => {
      clearTimeout(timer);
      reject(new Error(`El backend empaquetado terminó con código ${code}. ${stderr}`));
    });
    process.once('error', reject);
  });
}

try {
  const forbidden = listPackage(asar).filter(entry =>
    /^\\(server|src|shared|scripts)(\\|$)/i.test(entry)
    || /\.(ts|tsx|map)$/i.test(entry)
    || /server\.bundle\.cjs$/i.test(entry)
    || /^\\config-private(\\|$)/i.test(entry));
  if (forbidden.length) throw new Error(`El ASAR contiene fuentes prohibidas:\n${forbidden.join('\n')}`);

  const dataDir = path.join(scratch, 'maps-data');
  const mediaDir = path.join(scratch, 'maps-multimedia');
  const privateDir = path.join(scratch, 'config-private');
  await Promise.all([mkdir(dataDir), mkdir(mediaDir), mkdir(privateDir)]);
  child = spawn(executable, [loader], {
    cwd: scratch,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      API_PORT: '0',
      MAPS_DATA_DIR: dataDir,
      MAPS_MULTIMEDIA_DIR: mediaDir,
      PRIVATE_CONFIG_DIR: privateDir,
      STATIC_DIR: path.join(asar, 'dist'),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  const port = await ready(child);
  const origin = `http://127.0.0.1:${port}`;
  const [health, html] = await Promise.all([fetch(`${origin}/api/health`), fetch(origin)]);
  if (!health.ok || (await health.json()).status !== 'ok') throw new Error('Falló /api/health en el paquete.');
  if (!html.ok || !(await html.text()).includes('<div id="root"></div>')) throw new Error('El frontend no se sirvió desde el ASAR.');
  process.stdout.write('ASAR, bytecode, backend, sharp y frontend empaquetados: OK.\n');
} finally {
  if (child && child.exitCode === null) {
    await new Promise(resolve => {
      const timer = setTimeout(resolve, 5_000);
      child.once('exit', () => {
        clearTimeout(timer);
        resolve();
      });
      child.kill();
    });
  }
  await rm(scratch, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
