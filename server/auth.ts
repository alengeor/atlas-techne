import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { z } from 'zod';
import { HttpError } from './errors.js';

const adminSchema = z.object({ username: z.string().min(1), salt: z.string().regex(/^[a-f0-9]{32}$/), hash: z.string().regex(/^[a-f0-9]{128}$/) });
export function passwordHash(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 128 * 1024 * 1024 }, (error, value) => error ? reject(error) : resolve(value)));
}
export class Auth {
  private sessions = new Map<string, { username: string; expires: number }>();
  private attempts = new Map<string, { count: number; reset: number }>();
  constructor(private privateDir: string) {}
  user(req: IncomingMessage) {
    const token = req.headers.cookie?.split(';').map(s => s.trim()).find(s => s.startsWith('atlas_session='))?.slice(14);
    if (!token) return null;
    const session = this.sessions.get(token);
    if (!session || session.expires < Date.now()) { this.sessions.delete(token); return null; }
    return { username: session.username, role: 'editor' as const };
  }
  async login(username: string, password: string, req: IncomingMessage, res: ServerResponse) {
    const key = req.socket.remoteAddress ?? 'local';
    const now = Date.now();
    const attempt = this.attempts.get(key);
    if (attempt && attempt.reset > now && attempt.count >= 8) throw new HttpError(429, 'TOO_MANY_ATTEMPTS');
    this.attempts.set(key, { count: attempt && attempt.reset > now ? attempt.count + 1 : 1, reset: attempt && attempt.reset > now ? attempt.reset : now + 15 * 60_000 });
    let admin: z.infer<typeof adminSchema>;
    try { admin = adminSchema.parse(JSON.parse(await readFile(path.join(this.privateDir, 'admin.json'), 'utf8'))); }
    catch { throw new HttpError(503, 'ADMIN_NOT_CONFIGURED'); }
    const hash = await passwordHash(password, admin.salt);
    if (username !== admin.username || !timingSafeEqual(hash, Buffer.from(admin.hash, 'hex'))) throw new HttpError(401, 'INVALID_CREDENTIALS');
    this.attempts.delete(key);
    this.logout(req, res);
    for (const [token, session] of this.sessions) if (session.expires < now) this.sessions.delete(token);
    const token = randomBytes(32).toString('hex');
    this.sessions.set(token, { username, expires: now + 8 * 60 * 60_000 });
    res.setHeader('Set-Cookie', `atlas_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${req.headers.origin?.startsWith('https://') ? '; Secure' : ''}`);
    return { username, role: 'editor' as const };
  }
  logout(req: IncomingMessage, res: ServerResponse) {
    const token = req.headers.cookie?.split(';').map(s => s.trim()).find(s => s.startsWith('atlas_session='))?.slice(14);
    if (token) this.sessions.delete(token);
    res.setHeader('Set-Cookie', 'atlas_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
  }
}
