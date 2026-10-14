import { build } from 'esbuild';
import bytenode from 'bytenode';
import electronPath from 'electron';
import { mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(root, 'dist-electron');
const plainBundle = path.join(outputDir, 'server.bundle.cjs');
const bytecode = path.join(outputDir, 'server.jsc');

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

await build({
  entryPoints: [path.join(root, 'server', 'index.ts')],
  outfile: plainBundle,
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node24',
  minify: true,
  sourcemap: false,
  legalComments: 'none',
  external: ['sharp'],
  define: { 'process.env.NODE_ENV': '"production"' },
});

try {
  await bytenode.compileFile({
    filename: plainBundle,
    output: bytecode,
    compileAsModule: true,
    electron: true,
    electronPath,
  });
  const result = await stat(bytecode);
  if (!result.isFile() || result.size === 0) throw new Error('Bytenode no generó un bytecode válido.');
} finally {
  await rm(plainBundle, { force: true });
}

console.log(`Backend protegido generado en ${path.relative(root, bytecode)}`);
