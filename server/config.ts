import path from 'node:path';
import { z } from 'zod';

const env = z.object({
  API_PORT: z.coerce.number().int().min(1024).max(65535).default(5174),
  MAPS_DATA_DIR: z.string().default('maps-data'), MAPS_MULTIMEDIA_DIR: z.string().default('maps-multimedia'),
  PRIVATE_CONFIG_DIR: z.string().default('config-private'),
  APP_ORIGINS: z.string().default('http://localhost:5173,http://localhost:4173'),
}).parse(process.env);
export const config = {
  port: env.API_PORT, dataDir: path.resolve(env.MAPS_DATA_DIR), mediaDir: path.resolve(env.MAPS_MULTIMEDIA_DIR),
  privateDir: path.resolve(env.PRIVATE_CONFIG_DIR), origins: env.APP_ORIGINS.split(',').map(value => new URL(value.trim()).origin),
};
export type StorageConfig = Pick<typeof config, 'dataDir' | 'mediaDir'>;
