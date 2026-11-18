import './scripts/env.ts';
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';

export default defineConfig({
  srcDir: './src/admin',
  publicDir: './src/admin/public',
  outDir: './dist/admin',
  cacheDir: './.cache/admin',
  output: 'server',
  session: false,
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  server: { host: '127.0.0.1', port: 4322 },
  security: { checkOrigin: true },
  devToolbar: { enabled: false },
});
