import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const preview = process.argv.includes('--preview');
const children = [];
let stopping = false;
function stop(code) {
  if (stopping) return; stopping = true;
  for (const child of children) child.kill('SIGTERM');
  process.exitCode = code;
}
const api = spawn(process.execPath, ['--env-file-if-exists=.env', ...(preview ? ['dist-server/index.js'] : ['--watch', '--import', 'tsx', 'server/index.ts'])], { cwd: root, stdio: 'inherit', windowsHide: true });
children.push(api);
const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', ...(preview ? ['preview'] : []), '--host', 'localhost'], { cwd: root, stdio: 'inherit', windowsHide: true });
children.push(vite);
for (const child of children) {
  child.on('error', error => { console.error(error.message); stop(1); });
  child.on('exit', code => { if (!stopping) stop(code ?? 1); });
}
process.on('SIGINT', () => stop(0)); process.on('SIGTERM', () => stop(0));
