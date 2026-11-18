import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, readFile, writeFile, readdir, rm, access, symlink, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { prepareContent, parseDocument, validateBody } from '../scripts/content-pipeline.ts';
import Markdoc from '@markdoc/markdoc';

async function fixture(run: (source: string, output: string) => Promise<void>) {
  const root = await mkdtemp(path.join(tmpdir(), 'portfolio-content-'));
  try {
    await cp('examples/content', path.join(root, 'content'), { recursive: true });
    await run(path.join(root, 'content'), path.join(root, 'output'));
  } finally { await rm(root, { recursive: true, force: true }); }
}
async function change(source: string, filename: string, transform: (text: string) => string) {
  const file = path.join(source, filename);
  await writeFile(file, transform(await readFile(file, 'utf8')));
}

test('iki dilde sadece yayınlı içerik; taslak ve görseli çıktıda yok', () => fixture(async (source, output) => {
  const result = await prepareContent(source, output);
  assert.equal(result.count, 6);
  assert.equal(result.mediaCount, 0);
  assert.deepEqual((await readdir(path.join(output, 'content/posts'))).sort(), ['static-first-en.mdoc', 'static-first-tr.mdoc']);
  assert.deepEqual(await readdir(path.join(output, 'public/media')), []);
}));
test('gelecek yayın tarihi ve Babintech izin eksikliği build girdisini reddeder', () => fixture(async (source, output) => {
  await change(source, 'posts/static-first-tr.mdoc', (value) => value.replace('2026-11-16', '2099-01-01'));
  await assert.rejects(prepareContent(source, output), /gelecekte/);
  await change(source, 'posts/static-first-tr.mdoc', (value) => value.replace('2099-01-01', '2026-11-16').replace('"personal"', '"babintech"'));
  await assert.rejects(prepareContent(source, output), /yayın izni/);
}));
test('yayınsız featured kayıt build girdisini reddeder', () => fixture(async (source, output) => {
  await change(source, 'projects/portfolio-tr.mdoc', (value) => value.replace('"published"', '"draft"'));
  await assert.rejects(prepareContent(source, output), /Featured/);
}));
test('başarısız doğrulama önceki build girdisini korur', () => fixture(async (source, output) => {
  await prepareContent(source, output);
  const previous = await readFile(path.join(output, 'manifest.json'), 'utf8');
  await change(source, 'posts/static-first-tr.mdoc', (value) => value.replace('"status": "published"', '"status": "unknown"'));
  await assert.rejects(prepareContent(source, output));
  assert.equal(await readFile(path.join(output, 'manifest.json'), 'utf8'), previous);
}));
test('yinelenen kimlik ve URL reddedilir', () => fixture(async (source, output) => {
  await cp(path.join(source, 'posts/static-first-tr.mdoc'), path.join(source, 'posts/copy.mdoc'));
  await assert.rejects(prepareContent(source, output), /Yinelenen içerik kimliği/);
  await change(source, 'posts/copy.mdoc', (value) => value.replace('static-first-tr', 'other-tr').replace('"static-first"', '"other"'));
  await assert.rejects(prepareContent(source, output), /Yinelenen URL/);
}));
test('Markdown bağlantısı ve medya aktif içerik taşıyamaz', () => {
  const unsafe = '[X](javascript:alert%281%29)';
  validateBody(unsafe);
  assert.doesNotMatch(Markdoc.renderers.html(Markdoc.transform(Markdoc.parse(unsafe))), /href=/);
  assert.throws(() => validateBody('![X](https://example.com/x.png)'), /Medya/);
  assert.throws(() => validateBody('![X](/media/../secret.png)'), /Medya/);
  assert.throws(() => validateBody('{% unknown %}x{% /unknown %}'));
  assert.doesNotThrow(() => validateBody('```html\n<script>alert(1)</script>\n```'));
});
test('kaynak dışına çıkan symlink medya reddedilir', () => fixture(async (source, output) => {
  const outside = path.join(path.dirname(source), 'outside.png');
  await cp(path.join(source, 'media/private-draft-sentinel.png'), outside);
  await symlink(outside, path.join(source, 'media/escape.png'));
  await change(source, 'projects/portfolio-tr.mdoc', (value) => value.replace('"title":', '"cover": "/media/escape.png", "title":'));
  await assert.rejects(prepareContent(source, output), /Güvenli olmayan medya/);
}));
test('CMS boş opsiyonel alanları destekler, bilinmeyen alanlar reddedilir', async () => {
  const text = await readFile('examples/content/posts/static-first-tr.mdoc', 'utf8');
  assert.equal(parseDocument(text.replace('"title":', '"cover": null, "role": "", "title":')).data.cover, undefined);
  assert.throws(() => parseDocument(text.replace('"title":', '"privateToken": "secret", "title":')));
});
test('yalnızca referans verilen geçerli raster medya yeniden kodlanır', () => fixture(async (source, output) => {
  const sharp = (await import('sharp')).default;
  await mkdir(path.join(source, 'media/portfolio-tr'), { recursive: true });
  await sharp({ create: { width: 2, height: 2, channels: 3, background: '#145b43' } })
    .png().withMetadata({ orientation: 6 }).toFile(path.join(source, 'media/portfolio-tr/cover.png'));
  await change(source, 'projects/portfolio-tr.mdoc', (value) => value.replace('"title":', '"cover": "/media/portfolio-tr/cover.png", "title":'));
  const result = await prepareContent(source, output);
  assert.equal(result.mediaCount, 1);
  assert.deepEqual(await readdir(path.join(output, 'public/media')), ['portfolio-tr']);
  assert.equal((await sharp(path.join(output, 'public/media/portfolio-tr/cover.png')).metadata()).exif, undefined);
}));
test('arşivlenmiş kayıt ve referanssız medya yayınlanmaz', () => fixture(async (source, output) => {
  await change(source, 'posts/static-first-tr.mdoc', (value) => value.replace('"published"', '"archived"'));
  const result = await prepareContent(source, output);
  assert.equal(result.count, 5);
  await assert.rejects(access(path.join(output, 'content/posts/static-first-tr.mdoc')));
}));
