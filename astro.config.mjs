import './scripts/env.ts';
import { defineConfig } from 'astro/config';
import markdoc from '@astrojs/markdoc';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  srcDir: './src/site',
  publicDir: './.generated/public',
  outDir: './dist/public',
  cacheDir: './.cache/public',
  output: 'static',
  site: process.env.SITE_URL || undefined,
  trailingSlash: 'always',
  integrations: [markdoc()],
  vite: { plugins: [tailwindcss()], build: { assetsInlineLimit: 0 } },
  server: { host: '127.0.0.1' },
  devToolbar: { enabled: false },
});
