import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'API_');
  const proxy = { '/api': { target: `http://127.0.0.1:${env.API_PORT || '5174'}` } };
  return {
  plugins: [react()],
  server: {
    port: Number(process.env.WEB_PORT ?? 5173),
    strictPort: true,
    proxy,
    fs: { deny: ['.env', '.env.*', '**/.git/**', '**/maps-data/**', '**/maps-multimedia/**', '**/config-private/**'] },
  },
  build: { sourcemap: false },
  preview: { port: 4173, strictPort: true, proxy },
  };
});
