import { config } from './config.js';
import { MapStorage } from './storage.js';
import { Auth } from './auth.js';
import { createApp } from './app.js';

const storage = new MapStorage(config);
await storage.init();
const server = createApp(storage, new Auth(config.privateDir), config.origins);
server.on('error', error => { console.error(JSON.stringify({ event: 'server.start.failed', code: 'code' in error ? error.code : 'UNKNOWN' })); process.exit(1); });
server.listen(config.port, '127.0.0.1', () => console.log(`Atlas Austral · servidor local en puerto ${config.port}`));
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => server.close(() => process.exit(0)));
