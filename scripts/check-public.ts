import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

async function walk(directory: string): Promise<string[]> {
  const children = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(children.map((child) => child.isDirectory() ? walk(path.join(directory, child.name)) : [path.join(directory, child.name)]))).flat();
}
const files = await walk('dist/public');
let cssBytes = 0;
let jsBytes = 0;
for (const filename of files) {
  if (/\.(?:mjs|map|mdoc|md|tsx?|ya?ml|docx?)$/.test(filename) || /(?:keystatic|\.git|\.env|private-draft|referans|colorscheme|originals)/i.test(filename))
    throw new Error(`Public çıktıda yasak dosya: ${filename}`);
  if (filename.endsWith('.js') && !filename.startsWith('dist/public/_astro/')) throw new Error(`Beklenmeyen script yolu: ${filename}`);
  if (/\.(?:html|css|js|json|xml|txt)$/.test(filename)) {
    const source = await readFile(filename, 'utf8');
    if (/PRIVATE_(?:DRAFT|BODY)_SENTINEL|KEYSTATIC_(?:GITHUB_CLIENT_SECRET|SECRET)|unconfigured\/portfolio-content|\/api\/keystatic/i.test(source))
      throw new Error(`Public çıktı sınırı ihlali: ${filename}`);
    if (filename.endsWith('.html')) {
      for (const script of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
        if (!/\bsrc="\/_astro\/[A-Za-z0-9_.-]+\.js"/.test(script[1]!) || script[2]!.trim())
          throw new Error(`Yalnızca derlenmiş aynı-origin script'leri kullanılabilir: ${filename}`);
      }
    }
    if (filename.endsWith('.css')) cssBytes += gzipSync(source).length;
    if (filename.endsWith('.js')) jsBytes += gzipSync(source).length;
  }
}
if (cssBytes > 30 * 1024) throw new Error('Public CSS 30 KiB gzip bütçesini aşıyor.');
if (jsBytes > 40 * 1024) throw new Error('Public JavaScript 40 KiB gzip bütçesini aşıyor.');
console.log(`Public çıktı doğrulandı: ${files.length} dosya; JS gzip ${(jsBytes / 1024).toFixed(1)} KiB; CSS gzip ${(cssBytes / 1024).toFixed(1)} KiB.`);
