import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export async function prepareBrand(output: string) {
  await mkdir(output, { recursive: true });
  const mark = (await readFile('src/assets/brand/mark.svg', 'utf8'))
    .replace(/var\(--brand-left, #285c70\)/g, '#285c70')
    .replace(/var\(--brand-right, #608b98\)/g, '#608b98')
    .replace(/var\(--brand-ink, #e2d9da\)/g, '#e2d9da');
  const paths = mark.slice(mark.indexOf('>') + 1, mark.lastIndexOf('</svg>'));
  const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="48" fill="#111111"/><g transform="translate(20 60) scale(.9)">${paths}</g></svg>`;
  await writeFile(path.join(output, 'favicon.svg'), favicon);
  await sharp(Buffer.from(favicon)).resize(180, 180).png().toFile(path.join(output, 'apple-touch-icon.png'));
  await sharp('src/assets/brand/originals/logo_banner.png')
    .resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 82 })
    .toFile(path.join(output, 'social.webp'));
}
