import { z } from 'zod';
import { assetSchema, type LocalizedText } from '../../shared/model';
import { changesBetween, mapRecordSchema, sessionSchema, type MapRecord } from '../../shared/api';
import type { MapDocument } from '../../shared/model';

export class ApiError extends Error { constructor(public code: string, public status: number) { super(code); } }
function errorCode(value: unknown) { const parsed = z.object({ code: z.string() }).safeParse(value); return parsed.success ? parsed.data.code : 'SERVER_ERROR'; }
async function request<T>(url: string, schema: z.ZodType<T>, options?: RequestInit): Promise<T> {
  let res: Response;
  try { res = await fetch(url, { ...options, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-Atlas-Request': '1', ...options?.headers } }); }
  catch (error) { if (options?.signal?.aborted) throw error; throw new ApiError('NETWORK_ERROR', 0); }
  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(errorCode(json), res.status);
  return schema.parse(json);
}
function upload<T>(url: string, file: File, schema: z.ZodType<T>, progress: (percent: number) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest(); xhr.open('POST', url); xhr.setRequestHeader('Content-Type', file.type); xhr.setRequestHeader('X-Atlas-Request', '1'); xhr.timeout = 60000;
    xhr.upload.onprogress = e => { if (e.lengthComputable) progress(Math.round(e.loaded / e.total * 100)); };
    xhr.onerror = xhr.ontimeout = () => reject(new ApiError('NETWORK_ERROR', 0));
    xhr.onload = () => {
      try {
        const value: unknown = JSON.parse(xhr.responseText);
        if (xhr.status < 200 || xhr.status >= 300) { reject(new ApiError(errorCode(value), xhr.status)); return; }
        resolve(schema.parse(value));
      } catch { reject(new ApiError('SERVER_ERROR', xhr.status)); }
    };
    xhr.send(file);
  });
}
export const api = {
  session: (signal?: AbortSignal) => request('/api/session', sessionSchema, { signal }),
  login: (username: string, password: string) => request('/api/session', sessionSchema, { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: () => request('/api/session', sessionSchema, { method: 'DELETE' }),
  catalog: (signal?: AbortSignal) => request('/api/maps', z.array(mapRecordSchema), { signal }),
  create: (title: LocalizedText, file: File, progress: (value: number) => void) => upload(`/api/maps?${new URLSearchParams({ title: JSON.stringify(title), name: file.name })}`, file, mapRecordSchema, progress),
  upload: (id: string, file: File, kind: 'layers' | 'icons' | 'markers', progress: (value: number) => void) => upload(`/api/maps/${id}/assets?${new URLSearchParams({ name: file.name, kind })}`, file, assetSchema, progress),
  save: (record: MapRecord, map: MapDocument) => request(`/api/maps/${map.id}/changes`, mapRecordSchema, { method: 'POST', body: JSON.stringify({ revision: record.revision, changes: changesBetween(record.map, map) }) }),
  publish: (id: string, revision: number) => request(`/api/maps/${id}/publish`, mapRecordSchema, { method: 'POST', body: JSON.stringify({ revision }) }),
  unpublish: (id: string, revision: number) => request(`/api/maps/${id}/publish`, mapRecordSchema, { method: 'DELETE', body: JSON.stringify({ revision }) }),
};
export function assetUrl(mapId: string, assetId: string, thumbnail = false) { return `/api/maps/${mapId}/assets/${assetId}${thumbnail ? '?thumbnail=1' : ''}`; }
