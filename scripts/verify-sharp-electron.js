import { spawnSync } from 'node:child_process';
import electronPath from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const worker = path.join(root, 'scripts', 'verify-sharp-runtime.cjs');
const result = spawnSync(electronPath, [worker], {
  cwd: root,
  env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
  encoding: 'utf8',
  windowsHide: true,
});

if (result.status !== 0) {
  throw new Error(`sharp no funciona con el runtime de Electron ${result.stderr || result.stdout}`);
}
process.stdout.write(result.stdout);
