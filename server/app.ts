import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { createReadStream } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { z, ZodError } from 'zod';
import { changesSchema } from '../shared/api.js';
import { localizedSchema } from '../shared/model.js';
import { Auth } from './auth.js';
import { HttpError } from './errors.js';
import { MapStorage } from './storage.js';

async function body(req: IncomingMessage, limit: number) {
  if (Number(req.headers['content-length'] ?? 0) > limit) throw new HttpError(413, 'BODY_TOO_LARGE');
  const chunks: Buffer[] = []; let length = 0;
  for await (const chunk of req) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)); length += bytes.length;
    if (length > limit) throw new HttpError(413, 'BODY_TOO_LARGE'); chunks.push(bytes);
  }
  return Buffer.concat(chunks);
}
async function jsonBody(req: IncomingMessage): Promise<unknown> {
  try { return JSON.parse((await body(req, 2 * 1024 * 1024)).toString('utf8')); }
  catch (error) { if (error instanceof HttpError) throw error; throw new HttpError(400, 'INVALID_INPUT'); }
}
export function createApp(storage: MapStorage, auth: Auth, origins: string[]) {
  const uploads = new Map<string, { count: number; reset: number }>();
  const server = createServer((req, res) => { void handle(req, res); });
  server.requestTimeout = 60_000; server.headersTimeout = 15_000;
  async function handle(req: IncomingMessage, res: ServerResponse) {
    const requestId = randomUUID();
    res.setHeader('X-Request-ID', requestId); res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff');
    const send = (value: unknown, status = 200) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(value)); };
    try {
      const url = new URL(req.url ?? '/', 'http://localhost'); const method = req.method ?? 'GET';
      if (method !== 'GET' && method !== 'HEAD') {
        if (!req.headers.origin || !origins.includes(req.headers.origin) || req.headers['x-atlas-request'] !== '1') throw new HttpError(403, 'ORIGIN_DENIED');
      }
      if (url.pathname === '/api/health' && method === 'GET') return send({ status: 'ok' });
      if (url.pathname === '/api/session') {
        if (method === 'GET') return send({ user: auth.user(req) });
        if (method === 'POST') { const { username, password } = z.object({ username: z.string().min(1).max(100), password: z.string().min(1).max(200) }).parse(await jsonBody(req)); return send({ user: await auth.login(username, password, req, res) }); }
        if (method === 'DELETE') { auth.logout(req, res); return send({ user: null }); }
      }
      const user = auth.user(req);
      if (method !== 'GET' && !user) throw new HttpError(401, 'UNAUTHORIZED');
      if (url.pathname === '/api/maps' && method === 'GET') return send(await storage.list(!!user));
      const mapMatch = /^\/api\/maps\/([a-zA-Z0-9-]+)$/.exec(url.pathname);
      if (mapMatch?.[1] && method === 'DELETE') {
        await storage.deleteMap(mapMatch[1]);
        return send({ success: true });
      }
      const assetMatch = /^\/api\/maps\/([a-zA-Z0-9-]+)\/assets\/([a-zA-Z0-9-]+)$/.exec(url.pathname);
      if (assetMatch?.[1] && assetMatch[2] && method === 'GET') {
        const asset = await storage.asset(assetMatch[1], assetMatch[2], !!user, url.searchParams.get('thumbnail') === '1');
        res.setHeader('Content-Type', asset.mime);
        const stream = createReadStream(asset.file); stream.on('error', () => res.destroy()); stream.pipe(res); return;
      }
      const match = /^\/api\/maps\/([a-zA-Z0-9-]+)\/(assets|changes|publish)$/.exec(url.pathname);
      if ((url.pathname === '/api/maps' || match?.[2] === 'assets') && method === 'POST') {
        const key = user?.username ?? 'anonymous', now = Date.now(), previous = uploads.get(key);
        if (previous && previous.reset > now && previous.count >= 60) throw new HttpError(429, 'TOO_MANY_UPLOADS');
        uploads.set(key, { count: previous && previous.reset > now ? previous.count + 1 : 1, reset: previous && previous.reset > now ? previous.reset : now + 60_000 });
        const bytes = await body(req, 25 * 1024 * 1024), name = url.searchParams.get('name') ?? '', mime = req.headers['content-type']?.split(';')[0] ?? '';
        if (url.pathname === '/api/maps') {
          let title: unknown; try { title = JSON.parse(url.searchParams.get('title') ?? 'null'); } catch { throw new HttpError(400, 'INVALID_INPUT'); }
          return send(await storage.create(localizedSchema.parse(title), bytes, name, mime), 201);
        }
        if (match?.[1]) return send(await storage.upload(match[1], bytes, name, mime, z.enum(['layers', 'icons', 'markers']).parse(url.searchParams.get('kind'))), 201);
      }
      if (match?.[1] && match[2] === 'changes' && method === 'POST') { const value = changesSchema.parse(await jsonBody(req)); return send(await storage.save(match[1], value.revision, value.changes)); }
      if (match?.[1] && match[2] === 'publish') {
        if (method === 'POST') { const { revision } = z.object({ revision: z.number().int() }).parse(await jsonBody(req)); return send(await storage.publish(match[1], revision)); }
        if (method === 'DELETE') { const { revision } = z.object({ revision: z.number().int() }).parse(await jsonBody(req)); return send(await storage.unpublish(match[1], revision)); }
      }
      throw new HttpError(404, 'NOT_FOUND');
    } catch (error) {
      const status = error instanceof HttpError ? error.status : error instanceof ZodError ? 400 : 500;
      const code = error instanceof HttpError ? error.code : error instanceof ZodError ? 'INVALID_INPUT' : 'SERVER_ERROR';
      console.error(JSON.stringify({ event: 'request.error', requestId, code, status }));
      if (!res.headersSent) send({ code, requestId }, status); else res.destroy();
    }
  }
  return server;
}
