import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { selectRuntime, supportsVersion } from '../scripts/runtime.mjs';

test('proje runtime minimumunu ve major sürüm sınırını uygular', () => {
  assert.equal(supportsVersion('22.23.1'), false);
  assert.equal(supportsVersion('24.22.2'), false);
  assert.equal(supportsVersion('v24.22.3'), true);
  assert.equal(supportsVersion('24.23.0'), true);
  assert.equal(supportsVersion('25.0.0'), false);
  assert.equal(supportsVersion('invalid'), false);
});

test('uyumlu mevcut Node ile mise gerekmez; uyumsuz Node kurulu sürüme yönlendirilir', () => {
  assert.equal(selectRuntime({ version: '24.22.3', executable: '/active/node', findInstalled() { throw new Error('çağrılmamalı'); } }), '/active/node');
  assert.equal(selectRuntime({ version: '22.23.1', executable: '/system/node', findInstalled: () => ({ executable: '/managed/node', version: '24.22.3' }) }), '/managed/node');
  assert.throws(() => selectRuntime({ version: '22.23.1', findInstalled: () => undefined }), /mise install node@24\.22\.3/);
  assert.throws(() => selectRuntime({ version: '22.23.1', findInstalled: () => ({ executable: '/old/node', version: '20.0.0' }) }), /Aktif sürüm: 22\.23\.1/);
});

test('alt süreç Node sürümünü, PATH ve boşluklu argümanları korur; çıkış kodunu iletir', () => {
  const result = spawnSync(process.execPath, [
    'scripts/runtime.mjs', '--input-type=module', '--eval',
    'console.log(JSON.stringify({ version: process.versions.node, bin: process.env.PATH.split(process.platform === "win32" ? ";" : ":")[0], arg: process.argv[1] }))',
    '--', 'an argument with spaces',
  ], { encoding: 'utf8' });
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 0, result.stderr);
  const actual = JSON.parse(result.stdout);
  assert.equal(supportsVersion(actual.version), true);
  assert.equal(actual.bin, path.dirname(process.execPath));
  assert.equal(actual.arg, 'an argument with spaces');
  assert.equal(spawnSync(process.execPath, ['scripts/runtime.mjs', '--eval', 'process.exit(7)']).status, 7);
});
