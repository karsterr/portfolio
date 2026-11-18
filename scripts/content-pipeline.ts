import { lstat, mkdir, readFile, readdir, realpath, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parse, stringify } from 'yaml';
import Markdoc from '@markdoc/markdoc';
import { documentSchema, settingsSchema, kinds, type Kind } from '../src/shared/content.ts';

export function parseDocument(text: string) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  if (!match) throw new Error('İçerik YAML frontmatter ile başlamalı.');
  const data = parse(match[1]!) as Record<string, unknown>;
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Frontmatter nesne olmalı.');
  for (const key of ['publishedAt', 'cover', 'role', 'organization', 'period', 'sortOrder', 'repositoryUrl', 'demoUrl'])
    if (data[key] === '' || data[key] === null) delete data[key];
  return { data: documentSchema.parse(data), body: match[2]! };
}

function mediaPath(value: string) {
  if (!/^\/media\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9][a-zA-Z0-9_. -]*\.(png|jpg|jpeg|webp|avif)$/i.test(value))
    throw new Error('Medya yalnızca /media/ altında güvenli bir raster dosyası olabilir.');
  return value.slice('/media/'.length);
}

export function validateBody(body: string) {
  if (!body.trim()) throw new Error('Yayımlanan içeriğin gövdesi boş olamaz.');
  const ast = Markdoc.parse(body);
  if (Markdoc.validate(ast).length) throw new Error('Desteklenmeyen Markdoc içeriği.');
  const media = new Set<string>();
  for (const node of ast.walk()) {
    if (node.type === 'tag' || Object.values(node.attributes).some((value) => value !== null && typeof value === 'object'))
      throw new Error('Dinamik Markdoc içeriği kapalı.');
    if (node.type === 'link') {
      const href = String(node.attributes.href ?? '');
      if (!(href.startsWith('#') || /^\/(?!\/)/.test(href))) {
        let url: URL;
        try { url = new URL(href); } catch { throw new Error('Geçersiz bağlantı.'); }
        if (!['https:', 'mailto:'].includes(url.protocol)) throw new Error('Güvenli olmayan bağlantı protokolü.');
      }
    }
    if (node.type === 'image') {
      const src = String(node.attributes.src ?? '');
      mediaPath(src);
      if (!node.attributes.alt) throw new Error('Görsel için alt metin gerekli.');
      media.add(src);
    }
  }
  return media;
}

export async function prepareContent(source: string, output: string, now = new Date()) {
  const root = await realpath(source);
  if (path.resolve(output) === root || root.startsWith(`${path.resolve(output)}${path.sep}`))
    throw new Error('Çıktı, kaynak dizinin kendisi veya üstü olamaz.');
  const staging = `${output}.staging-${process.pid}`;
  await rm(staging, { recursive: true, force: true });
  await mkdir(path.join(staging, 'public/media'), { recursive: true });
  const ids = new Set<string>();
  const translations = new Set<string>();
  const published: { kind: Kind; data: ReturnType<typeof documentSchema.parse> }[] = [];
  const media = new Set<string>();
  try {
    for (const kind of kinds) {
      await mkdir(path.join(staging, 'content', kind), { recursive: true });
      const files = await readdir(path.join(root, kind), { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => {
        if (error.code === 'ENOENT') return [];
        throw error;
      });
      const slugs = new Set<string>();
      for (const file of files.sort((a, b) => a.name.localeCompare(b.name))) {
        if (!file.isFile() || !file.name.endsWith('.mdoc')) throw new Error(`${kind}: yalnızca normal .mdoc dosyaları desteklenir.`);
        const { data, body } = parseDocument(await readFile(path.join(root, kind, file.name), 'utf8'));
        if (ids.has(data.id)) throw new Error(`Yinelenen içerik kimliği: ${data.id}`);
        ids.add(data.id);
        const key = `${data.locale}/${data.slug}`;
        if (slugs.has(key)) throw new Error(`Yinelenen URL: ${kind}/${key}`);
        slugs.add(key);
        const translation = `${kind}/${data.translationGroupId}/${data.locale}`;
        if (translations.has(translation)) throw new Error('Yinelenen çeviri kaydı.');
        translations.add(translation);
        if (data.status !== 'published') continue;
        if (!data.publishedAt || Date.parse(`${data.publishedAt}T00:00:00Z`) > now.getTime())
          throw new Error(`Yayın tarihi eksik veya gelecekte: ${data.id}`);
        if (data.origin === 'babintech' && !data.publicationApproved)
          throw new Error(`Babintech yayın izni gerekli: ${data.id}`);
        for (const item of validateBody(body)) media.add(item);
        if (data.cover) { mediaPath(data.cover); media.add(data.cover); }
        await writeFile(path.join(staging, 'content', kind, `${data.id}.mdoc`), `---\n${stringify(data, { defaultStringType: 'QUOTE_DOUBLE' })}---\n${body}`);
        published.push({ kind, data });
      }
    }
    const settings = settingsSchema.parse(JSON.parse(await readFile(path.join(root, 'settings.json'), 'utf8')));
    for (const id of settings.featuredProjectIds)
      if (!published.some((item) => item.kind === 'projects' && item.data.id === id))
        throw new Error(`Featured proje yayımlanmamış veya eksik: ${id}`);
    const sharp = (await import('sharp')).default;
    for (const value of media) {
      const filename = mediaPath(value);
      const input = path.join(root, 'media', filename);
      const resolved = await realpath(input);
      if (!resolved.startsWith(`${root}${path.sep}`) || !(await lstat(input)).isFile()) throw new Error('Güvenli olmayan medya yolu.');
      if ((await lstat(input)).size > 10 * 1024 * 1024) throw new Error('Medya 10 MiB sınırını aşıyor.');
      const image = sharp(input, { limitInputPixels: 24_000_000, animated: false });
      const metadata = await image.metadata();
      const extension = path.extname(filename).slice(1).toLowerCase();
      const expected = extension === 'jpg' || extension === 'jpeg' ? 'jpeg' : extension;
      if (metadata.format !== expected || (metadata.pages ?? 1) > 1) throw new Error('Medya biçimi uyuşmuyor veya animasyon içeriyor.');
      const destination = path.join(staging, 'public/media', filename);
      await mkdir(path.dirname(destination), { recursive: true });
      await image.rotate().toFile(destination);
    }
    await writeFile(path.join(staging, 'settings.json'), JSON.stringify(settings, null, 2));
    await writeFile(path.join(staging, 'manifest.json'), JSON.stringify({ schemaVersion: 1, count: published.length, generatedAt: now.toISOString() }));
    // Üretimde etkinleştirme ayrı release dizinleriyle yapılır. Burada sadece build girdisi değiştirilir.
    await rm(output, { recursive: true, force: true });
    await mkdir(path.dirname(output), { recursive: true });
    await rename(staging, output);
    return { count: published.length, mediaCount: media.size };
  } catch (error) {
    await rm(staging, { recursive: true, force: true });
    throw error;
  }
}
