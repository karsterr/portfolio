import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { prepareBrand } from '../scripts/brand.ts';

test('marka build girdisi yalnızca optimize favicon, touch ikonu ve banner üretir', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'portfolio-brand-'));
  try {
    await prepareBrand(directory);
    assert.deepEqual((await readdir(directory)).sort(), ['apple-touch-icon.png', 'favicon.svg', 'social.webp']);
    const icon = await sharp(path.join(directory, 'apple-touch-icon.png')).metadata();
    assert.equal(icon.width, 180);
    assert.equal(icon.height, 180);
    const social = await sharp(path.join(directory, 'social.webp')).metadata();
    assert.equal(social.width, 1200);
    assert.equal(social.height, 400);
    assert.equal(social.exif, undefined);
    assert((await stat(path.join(directory, 'social.webp'))).size < 100 * 1024);
    assert.doesNotMatch(await readFile(path.join(directory, 'favicon.svg'), 'utf8'), /var\(|<script|referans/i);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
