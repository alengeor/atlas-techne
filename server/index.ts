import { config } from './config.js';
import { MapStorage } from './storage.js';
import { Auth, ensureEditorAccount } from './auth.js';
import { createApp } from './app.js';

async function main() {
  const storage = new MapStorage(config);
  await storage.init();
  await ensureEditorAccount(config.privateDir);
  const server = createApp(storage, new Auth(config.privateDir), config.origins, config.staticDir);
  server.on('error', error => {
    console.error(JSON.stringify({ event: 'server.start.failed', code: 'code' in error ? error.code : 'UNKNOWN' }));
    process.exit(1);
  });
  server.listen(config.port, '127.0.0.1', () => {
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('No se pudo resolver el puerto local.');
    console.log(JSON.stringify({ event: 'server.ready', port: address.port }));
  });

  let stopping = false;
  const stop = () => {
    if (stopping) return;
    stopping = true;
    const force = setTimeout(() => {
      server.closeAllConnections();
      process.exit(0);
    }, 4_000);
    force.unref();
    server.close(() => {
      clearTimeout(force);
      process.exit(0);
    });
  };
  for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, stop);
}

void main().catch(error => {
  console.error(JSON.stringify({ event: 'server.start.failed', message: error instanceof Error ? error.message : String(error) }));
  process.exit(1);
});
