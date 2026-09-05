import { mkdir, writeFile } from 'node:fs/promises';
import { randomBytes, scryptSync } from 'node:crypto';
import path from 'node:path';
import readline from 'node:readline/promises';
import { Writable } from 'node:stream';

let muted = false;
const output = new Writable({ write(chunk, encoding, done) { if (!muted) process.stdout.write(chunk, encoding); done(); } });
const terminal = readline.createInterface({ input: process.stdin, output, terminal: true });
try {
  const username = (await terminal.question('Usuario Editor: ')).trim();
  process.stdout.write('Contraseña (oculta): '); muted = true;
  const password = await terminal.question(''); muted = false; process.stdout.write('\n');
  if (!username || password.length < 8) throw new Error('Ingresá un usuario y una contraseña de al menos 8 caracteres.');
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 128 * 1024 * 1024 }).toString('hex');
  const directory = path.resolve(process.env.PRIVATE_CONFIG_DIR ?? 'config-private');
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'admin.json'), JSON.stringify({ username, salt, hash }, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  process.stdout.write('Editor creado.\n');
} finally { terminal.close(); }
